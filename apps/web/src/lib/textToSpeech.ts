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
