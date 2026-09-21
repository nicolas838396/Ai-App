import { supabase } from "./supabaseClient";
import type { VoiceGender } from "./preferences";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let currentAudio: HTMLAudioElement | null = null;

// Plays a natural-sounding ElevenLabs voice for the given text. Throws if
// the backend isn't configured with an ElevenLabs key, the daily character
// budget is used up, or the request otherwise fails — callers should catch
// this and fall back to the browser's built-in speech synthesis.
export async function speakWithElevenLabs(text: string, gender: VoiceGender, onEnd?: () => void): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Nicht angemeldet");
  }

  const response = await fetch(`${apiUrl}/api/chat/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ text, gender }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `TTS request failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  stopElevenLabsSpeech();

  const audio = new Audio(url);
  currentAudio = audio;
  const cleanup = () => {
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
    onEnd?.();
  };
  audio.onended = cleanup;
  audio.onerror = cleanup;
  await audio.play();
}

export function stopElevenLabsSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}
