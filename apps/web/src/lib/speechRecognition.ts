// Minimal typings for the non-standard Web Speech API (SpeechRecognition),
// which TypeScript's DOM lib doesn't include.
interface SpeechRecognitionResultAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionResultAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type SpeechLang = "de-DE" | "en-US";

export interface SpeechRecognizerOptions {
  lang?: SpeechLang;
  /** false = the browser auto-stops after a pause, firing a final result — used for voice mode's turn-taking. */
  continuous?: boolean;
}

export function isSttSupported(): boolean {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onEnd: () => void,
  options: SpeechRecognizerOptions = {},
): SpeechRecognitionInstance | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = options.lang ?? "de-DE";
  recognition.continuous = options.continuous ?? true;
  recognition.interimResults = true;
  recognition.onresult = (event) => {
    let transcript = "";
    let isFinal = false;
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    onResult(transcript, isFinal);
  };
  recognition.onerror = () => onEnd();
  recognition.onend = onEnd;
  return recognition;
}
