import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import { PrismaService } from "../../prisma/prisma.service";
import type { SendMessageDto } from "./dto/send-message.dto";

const SYSTEM_PROMPT = `Du bist ein einfühlsamer, unterstützender Begleiter in einer Mental-Health-App.
Du hörst zu, stellst reflektierende Fragen und hilfst beim Einordnen von Gefühlen und Gewohnheiten.
Du bist kein Therapeut und stellst keine Diagnosen. Bei Hinweisen auf akute Selbst- oder
Fremdgefährdung verweist du ruhig und klar auf professionelle Hilfe bzw. den Notruf.
Antworte warm, kurz und konkret auf Deutsch, sofern der Nutzer nicht in einer anderen Sprache schreibt.`;

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

  async sendMessage(userId: string, dto: SendMessageDto) {
    const conversation = dto.conversationId
      ? await this.prisma.chatConversation.findFirstOrThrow({
          where: { id: dto.conversationId, userId },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      : await this.prisma.chatConversation.create({
          data: { userId },
          include: { messages: true },
        });

    await this.prisma.chatMessage.create({
      data: { conversationId: conversation.id, role: "user", content: dto.content },
    });

    const history = [...conversation.messages, { role: "user", content: dto.content }];

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
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
