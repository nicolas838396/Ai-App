import type { VoiceGender } from "./preferences";

const FEMALE_VOICE_HINTS = ["anna", "petra", "helena", "female", "samantha", "victoria", "martina"];
const MALE_VOICE_HINTS = ["markus", "yannick", "male", "daniel", "alex", "stefan", "reed"];

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const timeout = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], gender: VoiceGender): SpeechSynthesisVoice | null {
  const german = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  const pool = german.length > 0 ? german : voices;
  const hints = gender === "female" ? FEMALE_VOICE_HINTS : MALE_VOICE_HINTS;
  const byHint = pool.find((v) => hints.some((hint) => v.name.toLowerCase().includes(hint)));
  return byHint ?? pool[0] ?? null;
}

export async function speak(text: string, gender: VoiceGender, onEnd?: () => void): Promise<void> {
  if (!isTtsSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const voices = await getVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(voices, gender);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "de-DE";
  }
  utterance.rate = 0.95;
  utterance.pitch = 1;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}

// Splits into sentence-bounded chunks capped at ~maxLen characters. Speaking
// one very long SpeechSynthesisUtterance is unreliable across browsers —
// notably Safari/WebKit (relevant since this app is tested on iPad Safari),
// which can silently stop partway through a long utterance — so long-form
// text (like a multi-minute bedtime story) is read as a chained sequence of
// shorter utterances instead.
function splitIntoSpeechChunks(text: string, maxLen = 200): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export interface LongSpeechHandle {
  stop: () => void;
}

/** Reads long-form text aloud chunk by chunk; `onProgress` gets (chunkIndex, totalChunks) before each chunk starts. */
export function speakLong(
  text: string,
  gender: VoiceGender,
  onProgress?: (chunkIndex: number, totalChunks: number) => void,
  onDone?: () => void,
): LongSpeechHandle {
  const chunks = splitIntoSpeechChunks(text);
  let cancelled = false;
  let index = 0;

  function playNext() {
    if (cancelled) return;
    if (index >= chunks.length) {
      onDone?.();
      return;
    }
    onProgress?.(index, chunks.length);
    void speak(chunks[index], gender, () => {
      index += 1;
      playNext();
    });
  }

  playNext();

  return {
    stop() {
      cancelled = true;
      stopSpeaking();
    },
  };
}
