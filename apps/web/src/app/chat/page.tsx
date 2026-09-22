"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Send, Sparkles, User, Image as ImageIcon, Mic, Square, Volume2, VolumeX, X, Headphones } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { Chip } from "@/components/Chip";
import { DuskGlow } from "@/components/DuskGlow";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { resizeImageForUpload } from "@/lib/imageResize";
import { isTtsSupported, speak, stopSpeaking } from "@/lib/textToSpeech";
import { speakWithElevenLabs, stopElevenLabsSpeech } from "@/lib/elevenLabsSpeech";
import { isSttSupported, createSpeechRecognizer, type SpeechLang } from "@/lib/speechRecognition";
import { getVoiceGenderPreference, setVoiceGenderPreference, type VoiceGender } from "@/lib/preferences";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

// Tappable conversation starters shown on an empty chat — gives people
// something to tap instead of a blank page staring back, without forcing
// them to think of an opener themselves.
const CONVERSATION_STARTER_KEYS: TranslationKey[] = [
  "chat.starter1",
  "chat.starter2",
  "chat.starter3",
  "chat.starter4",
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string | null;
  createdAt: string;
}

interface ChatConversation {
  id: string;
  createdAt: string;
  messages: ChatMessage[];
}

type VoiceStatus = "listening" | "thinking" | "speaking";

export default function ChatPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t, language } = useLanguage();
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | undefined>(undefined);

  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ttsSupported, setTtsSupported] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const voiceResolverRef = useRef<((gender: VoiceGender) => void) | null>(null);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognizer>>(null);

  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("listening");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceActiveRef = useRef(false);

  const sttLang: SpeechLang = language === "en" ? "en-US" : "de-DE";

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    setTtsSupported(isTtsSupported());
    setSttSupported(isSttSupported());
    return () => {
      voiceActiveRef.current = false;
      stopElevenLabsSpeech();
      stopSpeaking();
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    apiFetch<ChatConversation[]>("/chat/conversations")
      .then((conversations) => {
        const latest = conversations[0];
        if (latest) {
          setConversationId(latest.id);
          setMessages(latest.messages);
        }
      })
      .catch(() => setError(t("chat.historyError")))
      .finally(() => setLoadingHistory(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function ensureVoiceGenderChosen(): Promise<VoiceGender> {
    const existing = getVoiceGenderPreference();
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve) => {
      voiceResolverRef.current = resolve;
      setShowVoicePrompt(true);
    });
  }

  function chooseVoiceGender(gender: VoiceGender) {
    setVoiceGenderPreference(gender);
    setShowVoicePrompt(false);
    voiceResolverRef.current?.(gender);
    voiceResolverRef.current = null;
  }

  async function speakText(text: string, gender: VoiceGender, onEnd: () => void) {
    try {
      await speakWithElevenLabs(text, gender, onEnd);
    } catch {
      // ElevenLabs not configured, over its daily budget, or unreachable —
      // fall back to the browser's built-in voice rather than staying silent.
      await speak(text, gender, onEnd);
    }
  }

  async function handleSpeakMessage(message: ChatMessage) {
    if (speakingMessageId === message.id) {
      stopElevenLabsSpeech();
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }
    const gender = await ensureVoiceGenderChosen();
    setSpeakingMessageId(message.id);
    await speakText(message.content, gender, () =>
      setSpeakingMessageId((current) => (current === message.id ? null : current)),
    );
  }

  async function handleToggleTts() {
    if (ttsEnabled) {
      setTtsEnabled(false);
      stopElevenLabsSpeech();
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }
    await ensureVoiceGenderChosen();
    setTtsEnabled(true);
  }

  function handleToggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognizer = createSpeechRecognizer(
      (transcript) => setInput(transcript),
      () => {
        setListening(false);
        recognitionRef.current = null;
      },
      { continuous: true, lang: sttLang },
    );
    if (!recognizer) return;
    recognitionRef.current = recognizer;
    setListening(true);
    recognizer.start();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError(null);
    try {
      const dataUrl = await resizeImageForUpload(file);
      setPendingImage(dataUrl);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t("chat.imageProcessError"));
    }
  }

  async function sendChatMessage(content: string, imageDataUrl?: string | null): Promise<ChatMessage> {
    const result = await apiFetch<{ conversationId: string; message: ChatMessage }>("/chat/message", {
      method: "POST",
      body: JSON.stringify({
        conversationId: conversationIdRef.current,
        content,
        ...(imageDataUrl ? { imageDataUrl } : {}),
      }),
    });
    setConversationId(result.conversationId);
    setMessages((prev) => [...prev, result.message]);
    return result.message;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if ((!content && !pendingImage) || sending) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      imageDataUrl: pendingImage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    const imageToSend = pendingImage;
    setPendingImage(null);
    setSending(true);
    setError(null);

    try {
      const assistantMessage = await sendChatMessage(content, imageToSend);
      if (ttsEnabled) void handleSpeakMessage(assistantMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("chat.sendError"));
    } finally {
      setSending(false);
    }
  }

  // --- Voice mode: a hands-free listen → send → hear-reply → listen-again loop ---

  function openVoiceMode() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
    voiceActiveRef.current = true;
    setVoiceModeOpen(true);
    setVoiceError(null);
    void runVoiceTurn();
  }

  function closeVoiceMode() {
    voiceActiveRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    stopElevenLabsSpeech();
    stopSpeaking();
    setVoiceModeOpen(false);
    setVoiceTranscript("");
  }

  async function runVoiceTurn() {
    if (!voiceActiveRef.current) return;
    const gender = await ensureVoiceGenderChosen();
    if (!voiceActiveRef.current) return;

    setVoiceStatus("listening");
    setVoiceTranscript("");

    let latestTranscript = "";
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        latestTranscript = transcript;
        setVoiceTranscript(transcript);
      },
      () => {
        recognitionRef.current = null;
        if (!voiceActiveRef.current) return;
        const finalText = latestTranscript.trim();
        if (!finalText) {
          void runVoiceTurn();
          return;
        }
        void handleVoiceUtterance(finalText, gender);
      },
      { continuous: false, lang: sttLang },
    );

    if (!recognizer) {
      setVoiceError(t("chat.voiceNotSupported"));
      return;
    }
    recognitionRef.current = recognizer;
    recognizer.start();
  }

  async function handleVoiceUtterance(content: string, gender: VoiceGender) {
    setVoiceStatus("thinking");
    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content, createdAt: new Date().toISOString() },
    ]);
    try {
      const assistantMessage = await sendChatMessage(content);
      if (!voiceActiveRef.current) return;
      setVoiceStatus("speaking");
      await speakText(assistantMessage.content, gender, () => {
        if (voiceActiveRef.current) void runVoiceTurn();
      });
    } catch (err) {
      if (!voiceActiveRef.current) return;
      setVoiceError(err instanceof Error ? err.message : t("chat.sendError"));
    }
  }

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      <main
        className="mx-auto flex max-w-2xl flex-col px-6 py-6"
        style={{ height: "calc(100vh - 65px)" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{t("chat.title")}</h1>
            <p className="text-xs text-slate-500">{t("chat.disclaimer")}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {ttsSupported && (
              <button
                type="button"
                onClick={handleToggleTts}
                title={ttsEnabled ? t("chat.disableTts") : t("chat.enableTts")}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  ttsEnabled ? "bg-brand-500 text-white shadow-soft" : "bg-sand-100 text-slate-500 hover:text-slate-700"
                }`}
              >
                {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
          {loadingHistory && <p className="text-sm text-slate-400">{t("chat.loadingHistory")}</p>}
          {!loadingHistory && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="celebration-glow absolute inset-0 rounded-full bg-brand-400/40 blur-lg" />
                <Sparkles className="gentle-float relative h-9 w-9 text-brand-400" />
              </div>
              <p className="max-w-xs text-sm">{t("chat.emptyState")}</p>
              <div className="mt-1 flex max-w-sm flex-wrap justify-center gap-2">
                {CONVERSATION_STARTER_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInput(t(key))}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-soft transition hover:border-brand-200 hover:text-brand-600"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  message.role === "user" ? "bg-slate-200 text-slate-600" : "bg-brand-500 text-white"
                }`}
              >
                {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              </span>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "rounded-br-sm bg-brand-500 text-white"
                    : "rounded-bl-sm bg-sand-100 text-slate-700"
                }`}
              >
                {message.imageDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.imageDataUrl}
                    alt={t("chat.attachedImageAlt")}
                    className="mb-2 max-h-56 w-full rounded-xl object-cover"
                  />
                )}
                {message.content && <span>{message.content}</span>}
                {ttsSupported && message.role === "assistant" && message.content && (
                  <button
                    type="button"
                    onClick={() => handleSpeakMessage(message)}
                    className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {speakingMessageId === message.id ? (
                      <>
                        <Square className="h-3 w-3" /> {t("chat.stopSpeaking")}
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" /> {t("chat.speak")}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 pl-9 text-sm text-slate-400">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300" />
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}

        {pendingImage && (
          <div className="relative mt-3 inline-flex w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImage} alt={t("chat.selectedImageAlt")} className="h-16 w-16 rounded-xl object-cover shadow-soft" />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white shadow-soft"
              aria-label={t("chat.removeImage")}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-soft transition hover:text-slate-700"
            title={t("chat.attachImage")}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? t("chat.placeholderListening") : t("chat.placeholderDefault")}
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm shadow-soft"
          />
          {/* Voice controls sit to the right of the input, closest-to-furthest:
              mic records a voice message (transcribed into the text field to
              review before sending), headphones starts a fully hands-free
              voice conversation — mirroring Claude's own chat composer layout. */}
          {sttSupported && (
            <button
              type="button"
              onClick={handleToggleListening}
              title={listening ? t("chat.stopRecording") : t("chat.recordVoice")}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-soft transition ${
                listening ? "bg-red-500 text-white" : "bg-white text-slate-500 hover:text-slate-700"
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
          {sttSupported && (
            <button
              type="button"
              onClick={openVoiceMode}
              title={t("chat.startVoiceMode")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-soft transition hover:text-slate-700"
            >
              <Headphones className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={sending || (!input.trim() && !pendingImage)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </main>

      {showVoicePrompt && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-slate-800">{t("chat.voiceModalTitle")}</h2>
            <p className="mt-1.5 text-sm text-slate-500">{t("chat.voiceModalSubtitle")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip active={false} onClick={() => chooseVoiceGender("female")}>
                {t("chat.voiceFemale")}
              </Chip>
              <Chip active={false} onClick={() => chooseVoiceGender("male")}>
                {t("chat.voiceMale")}
              </Chip>
            </div>
          </div>
        </div>
      )}

      {voiceModeOpen && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center px-6 text-center">
          <DuskGlow state={voiceStatus} />

          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
            {voiceStatus === "listening" && <Mic className="h-9 w-9" />}
            {voiceStatus === "thinking" && <Sparkles className="h-9 w-9" />}
            {voiceStatus === "speaking" && <Volume2 className="h-9 w-9" />}
          </div>

          <p className="relative z-10 mt-8 text-lg font-semibold text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.3)]">
            {voiceStatus === "listening" && t("chat.voiceModeListening")}
            {voiceStatus === "thinking" && t("chat.voiceModeThinking")}
            {voiceStatus === "speaking" && t("chat.voiceModeSpeaking")}
          </p>
          <p className="relative z-10 mt-2 min-h-[1.5rem] max-w-sm text-sm text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">
            {voiceTranscript || (voiceStatus === "listening" ? t("chat.voiceModeHint") : "")}
          </p>
          {voiceError && <p className="relative z-10 mt-2 max-w-sm text-sm text-red-200">{voiceError}</p>}

          <button
            type="button"
            onClick={closeVoiceMode}
            className="relative z-10 mt-10 flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
            {t("chat.voiceModeEnd")}
          </button>
        </div>
      )}
    </>
  );
}
