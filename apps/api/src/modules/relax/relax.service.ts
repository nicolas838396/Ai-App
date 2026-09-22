import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";

// A slow, soothing narration pace — deliberately below normal reading/speaking
// speed so a "20 minute story" actually reads back at roughly that length
// aloud, not in a rushed monotone.
const WORDS_PER_MINUTE = 120;
// German (and to a lesser extent English) prose tokenizes far denser than a
// naive words≈tokens estimate suggests — measured empirically at ~3
// tokens/word for German story text, not the ~1.3-1.7 you'd guess from
// English rules of thumb. Underestimating this caused stories to cut off
// mid-sentence at the max_tokens limit instead of ending peacefully.
const TOKENS_PER_WORD = 3.3;
const MAX_TOKENS_CEILING = 16000;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

@Injectable()
export class RelaxService {
  private readonly anthropic: Anthropic;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>("ANTHROPIC_API_KEY"),
    });
    this.model = this.configService.get<string>("ANTHROPIC_MODEL") ?? "claude-sonnet-5";
  }

  async generateStoryIdeas(language: "de" | "en"): Promise<{ titles: string[] }> {
    const prompt =
      language === "de"
        ? `Erfinde 3 sehr kurze, stimmungsvolle Titel (je maximal 6 Wörter) für beruhigende Gute-Nacht-Geschichten für Erwachsene – warm, ruhig, ohne Spannung oder Grusel. Antworte NUR mit einem JSON-Array aus genau 3 Strings, ohne jeden weiteren Text.`
        : `Invent 3 very short, evocative titles (max 6 words each) for calming bedtime stories for adults – warm, gentle, no suspense or scares. Reply ONLY with a JSON array of exactly 3 strings, no other text.`;

    let response: Anthropic.Message;
    try {
      response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      });
    } catch {
      throw new ServiceUnavailableException("Geschichten-Ideen konnten nicht erstellt werden.");
    }

    const text = extractText(response);
    const titles = this.parseTitles(text);
    return { titles };
  }

  private parseTitles(text: string): string[] {
    try {
      const match = text.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(match ? match[0] : text);
      if (Array.isArray(parsed) && parsed.every((t) => typeof t === "string")) {
        return parsed.slice(0, 3);
      }
    } catch {
      // fall through to line-based fallback below
    }
    return text
      .split("\n")
      .map((line) => line.replace(/^[-*\d.)\s"]+|["\s]+$/g, "").trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  async generateStory(
    title: string,
    lengthMinutes: number,
    language: "de" | "en",
  ): Promise<{ title: string; content: string }> {
    const wordsTarget = lengthMinutes * WORDS_PER_MINUTE;
    const maxTokens = Math.min(MAX_TOKENS_CEILING, Math.round(wordsTarget * TOKENS_PER_WORD) + 300);

    const prompt =
      language === "de"
        ? `Schreibe eine beruhigende Gute-Nacht-Geschichte für Erwachsene mit dem Titel "${title}". Zielumfang: etwa ${wordsTarget} Wörter. Ton: warm, langsam, bildhaft, ohne Spannung, ohne Konflikt-Eskalation, ohne Schreckmomente – die Geschichte soll beim Zuhören müde und entspannt machen. Baue ruhige Sinneseindrücke ein (Licht, Geräusche, Gerüche). Ende friedlich, offen ausklingend, nicht abrupt. Gib NUR den Fließtext der Geschichte aus, ohne Titelzeile, ohne Meta-Kommentar.`
        : `Write a calming bedtime story for adults titled "${title}". Target length: about ${wordsTarget} words. Tone: warm, slow-paced, vivid but gentle, no suspense, no escalating conflict, no scares – it should make the listener feel sleepy and relaxed. Include calm sensory detail (light, sound, smell). End peacefully, trailing off gently rather than abruptly. Output ONLY the story's prose, no title line, no meta commentary.`;

    let response: Anthropic.Message;
    try {
      response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
    } catch {
      throw new ServiceUnavailableException("Die Geschichte konnte nicht erstellt werden.");
    }

    const content = extractText(response);
    return { title, content };
  }
}
