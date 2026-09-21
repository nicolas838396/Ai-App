import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";

// ElevenLabs' classic premade voices — stable, always available on any
// account, no voice cloning/library setup required.
const VOICE_IDS: Record<"male" | "female", string> = {
  female: "21m00Tcm4TlvDq8ikWAM", // "Rachel"
  male: "pNInz6obpgDQGcFmaJgB", // "Adam"
};

// Keeps the (per-character, paid) ElevenLabs cost predictable regardless of
// how often someone taps "read aloud".
const MAX_CHARACTERS_PER_DAY = 4000;

@Injectable()
export class TtsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async synthesize(userId: string, text: string, gender: "male" | "female"): Promise<Buffer> {
    const apiKey = this.configService.get<string>("ELEVENLABS_API_KEY");
    if (!apiKey) {
      throw new ServiceUnavailableException("Sprachausgabe ist momentan nicht konfiguriert.");
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const usedToday = await this.prisma.ttsRequest.aggregate({
      where: { userId, createdAt: { gte: startOfToday } },
      _sum: { characterCount: true },
    });
    const alreadyUsed = usedToday._sum.characterCount ?? 0;
    if (alreadyUsed + text.length > MAX_CHARACTERS_PER_DAY) {
      throw new BadRequestException(
        "Tageslimit für die Sprachausgabe erreicht. Versuch es morgen wieder.",
      );
    }

    const voiceId = VOICE_IDS[gender];
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException("Sprachausgabe ist gerade nicht verfügbar.");
    }

    await this.prisma.ttsRequest.create({
      data: { userId, characterCount: text.length },
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
