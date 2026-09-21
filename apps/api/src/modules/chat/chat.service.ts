import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import { PrismaService } from "../../prisma/prisma.service";
import type { ChatConversation, ChatMessage, User } from "@prisma/client";
import type { SendMessageDto } from "./dto/send-message.dto";

// How many of the most recent messages are always sent to the model
// verbatim. Anything older is folded into a running summary instead, so a
// long-running conversation doesn't keep growing the per-message cost (or
// eventually exceed the context window) while still letting the AI recall
// what mattered earlier on.
const RECENT_MESSAGE_WINDOW = 20;
// Only re-summarize once this many messages have fallen out of the active
// window, so summarization runs roughly every 10 turns instead of every one.
const SUMMARY_BATCH_SIZE = 10;

const SYSTEM_PROMPT = `Du bist ein einfühlsamer, unterstützender Begleiter in einer Mental-Health-App.
Du hörst zu, stellst reflektierende Fragen und hilfst beim Einordnen von Gefühlen und Gewohnheiten.
Du bist kein Therapeut und stellst keine Diagnosen. Bei Hinweisen auf akute Selbst- oder
Fremdgefährdung verweist du ruhig und klar auf professionelle Hilfe bzw. den Notruf.
Antworte warm, kurz und konkret auf Deutsch, sofern der Nutzer nicht in einer anderen Sprache schreibt.`;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES_PER_DAY = 3;
const DATA_URL_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/;

// A rough, non-diagnostic cycle-phase estimate from a self-reported last
// period start date + average length. Framed as a soft hint, never as fact,
// so the model doesn't attribute a mood to it uninvited.
function buildCycleContextNote(user: User): string | null {
  if (!user.cycleTrackingEnabled || !user.lastPeriodStartDate || !user.cycleLengthDays) {
    return null;
  }

  const length = user.cycleLengthDays;
  const daysSinceStart = Math.floor((Date.now() - user.lastPeriodStartDate.getTime()) / MS_PER_DAY);
  if (daysSinceStart < 0) return null;

  const cycleDay = (daysSinceStart % length) + 1;

  let phase: string;
  if (cycleDay <= 5) {
    phase = "Menstruation";
  } else if (cycleDay >= length - 4) {
    phase = "prämenstruelle Phase (PMS-anfällig)";
  } else if (Math.abs(cycleDay - Math.round(length / 2)) <= 1) {
    phase = "Eisprung";
  } else {
    phase = "Zyklusmitte";
  }

  return `Zusatzinfo (freiwillig angegeben, nur als sanfter Hintergrund, keine Tatsache): Die Nutzerin verfolgt ihren Menstruationszyklus und befindet sich rechnerisch aktuell etwa in der Phase "${phase}" (Tag ${cycleDay} von ${length}). Erwähne das nicht ungefragt und unterstelle keine Ursache für ihre Stimmung – nutze es höchstens im Hinterkopf, falls sie selbst körperliche oder emotionale Beschwerden schildert, die dazu passen könnten.`;
}

function buildSystemPrompt(user: User, memorySummary: string | null): string {
  const parts = [SYSTEM_PROMPT];
  if (memorySummary) {
    parts.push(
      `Zusammenfassung früherer Gespräche mit diesem Nutzer (älterer Kontext, nicht mehr im aktiven Nachrichtenfenster, aber weiterhin relevant): ${memorySummary}`,
    );
  }
  const cycleNote = buildCycleContextNote(user);
  if (cycleNote) parts.push(cycleNote);
  return parts.join("\n\n");
}

function parseImageDataUrl(dataUrl: string): { mediaType: "image/jpeg" | "image/png" | "image/webp"; base64: string } {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) {
    throw new BadRequestException("Ungültiges Bildformat. Erlaubt sind JPEG, PNG oder WebP.");
  }
  const mediaType = match[1] as "image/jpeg" | "image/png" | "image/webp";
  const base64 = match[2] as string;
  const byteSize = Math.ceil((base64.length * 3) / 4);
  if (byteSize > MAX_IMAGE_BYTES) {
    throw new BadRequestException("Das Bild ist zu groß (maximal 5 MB).");
  }
  return { mediaType, base64 };
}

function buildContentBlocks(message: Pick<ChatMessage, "content" | "imageDataUrl">): Anthropic.MessageParam["content"] {
  if (!message.imageDataUrl) {
    return message.content;
  }
  const { mediaType, base64 } = parseImageDataUrl(message.imageDataUrl);
  const blocks: Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> = [
    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
  ];
  if (message.content) {
    blocks.push({ type: "text", text: message.content });
  }
  return blocks;
}

@Injectable()
export class ChatService {
  private readonly anthropic: Anthropic;
  private readonly model: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>("ANTHROPIC_API_KEY"),
    });
    this.model = this.configService.get<string>("ANTHROPIC_MODEL") ?? "claude-sonnet-5";
  }

  // Keeps only the most recent RECENT_MESSAGE_WINDOW messages in the raw
  // context sent to the model; anything older is condensed into (and kept
  // up to date in) a running summary on the conversation.
  private async getMemory(
    conversation: ChatConversation,
    history: ChatMessage[],
  ): Promise<{ summary: string | null; activeMessages: ChatMessage[] }> {
    const idealCutoff = Math.max(0, history.length - RECENT_MESSAGE_WINDOW);
    let summary = conversation.summary;
    let summarizedCount = conversation.summarizedMessageCount;

    if (idealCutoff - summarizedCount >= SUMMARY_BATCH_SIZE) {
      const toFold = history.slice(summarizedCount, idealCutoff);
      summary = await this.foldIntoSummary(summary, toFold);
      summarizedCount = idealCutoff;
      await this.prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { summary, summarizedMessageCount: summarizedCount },
      });
    }

    return { summary, activeMessages: history.slice(summarizedCount) };
  }

  private async foldIntoSummary(previousSummary: string | null, messages: ChatMessage[]): Promise<string> {
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Nutzer" : "Mira"}: ${m.content || "[Bild ohne Text]"}`)
      .join("\n");

    const prompt = `Bisherige Zusammenfassung eines Gesprächs zwischen einem Nutzer und seinem KI-Begleiter in einer Mental-Health-App:
${previousSummary ?? "(noch keine)"}

Neuer Gesprächsausschnitt, der jetzt aus dem aktiven Kontextfenster fällt:
${transcript}

Aktualisiere die Zusammenfassung kompakt (max. ca. 300 Wörter). Behalte nur, was für eine einfühlsame Begleitung wirklich relevant bleibt: wiederkehrende Sorgen oder Themen, wichtige Lebensereignisse, Ziele, Fortschritte, getroffene Vereinbarungen. Lass Smalltalk und Nebensächliches weg. Schreibe sachlich in der dritten Person über den Nutzer, ohne direkte Anrede.`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!dto.content?.trim() && !dto.imageDataUrl) {
      throw new BadRequestException("Nachricht darf nicht leer sein");
    }

    if (dto.imageDataUrl) {
      parseImageDataUrl(dto.imageDataUrl); // validates format + size, throws if invalid
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const imagesToday = await this.prisma.chatMessage.count({
        where: {
          conversation: { userId },
          imageDataUrl: { not: null },
          createdAt: { gte: startOfToday },
        },
      });
      if (imagesToday >= MAX_IMAGES_PER_DAY) {
        throw new BadRequestException(
          `Du hast das Tageslimit von ${MAX_IMAGES_PER_DAY} Bildern erreicht. Versuch es morgen wieder.`,
        );
      }
    }

    const conversation = dto.conversationId
      ? await this.prisma.chatConversation.findFirstOrThrow({
          where: { id: dto.conversationId, userId },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      : await this.prisma.chatConversation.create({
          data: { userId },
          include: { messages: true },
        });

    const userMessage = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: dto.content ?? "",
        imageDataUrl: dto.imageDataUrl ?? null,
      },
    });

    const history = [...conversation.messages, userMessage];
    const { summary, activeMessages } = await this.getMemory(conversation, history);

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: buildSystemPrompt(user, summary),
      messages: activeMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: buildContentBlocks(m),
      })),
    });

    const assistantText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const assistantMessage = await this.prisma.chatMessage.create({
      data: { conversationId: conversation.id, role: "assistant", content: assistantText },
    });

    return { conversationId: conversation.id, message: assistantMessage };
  }

  findConversationsForUser(userId: string) {
    return this.prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }
}
