"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Send, Sparkles, User, Image as ImageIcon, Mic, Square, Volume2, VolumeX, X } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { Chip } from "@/components/Chip";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { resizeImageForUpload } from "@/lib/imageResize";
import { isTtsSupported, speak, stopSpeaking } from "@/lib/textToSpeech";
import { isSttSupported, createSpeechRecognizer } from "@/lib/speechRecognition";
import { getVoiceGenderPreference, setVoiceGenderPreference, type VoiceGender } from "@/lib/preferences";

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

export default function ChatPage() {
  const { session, loading: sessionLoading, slow } = useSession({ requireAuth: true });
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setTtsSupported(isTtsSupported());
    setSttSupported(isSttSupported());
    return () => {
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
      .catch(() => setError("Konnte Chat-Verlauf nicht laden."))
      .finally(() => setLoadingHistory(false));
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

  async function handleSpeakMessage(message: ChatMessage) {
    if (speakingMessageId === message.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }
    const gender = await ensureVoiceGenderChosen();
    setSpeakingMessageId(message.id);
    await speak(message.content, gender, () => setSpeakingMessageId((current) => (current === message.id ? null : current)));
  }

  async function handleToggleTts() {
    if (ttsEnabled) {
      setTtsEnabled(false);
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
      setImageError(err instanceof Error ? err.message : "Bild konnte nicht verarbeitet werden.");
    }
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
      const result = await apiFetch<{ conversationId: string; message: ChatMessage }>("/chat/message", {
        method: "POST",
        body: JSON.stringify({
          conversationId,
          content,
          ...(imageToSend ? { imageDataUrl: imageToSend } : {}),
        }),
      });
      setConversationId(result.conversationId);
      setMessages((prev) => [...prev, result.message]);
      if (ttsEnabled) void handleSpeakMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nachricht konnte nicht gesendet werden. Bitte versuch es erneut.");
    } finally {
      setSending(false);
    }
  }

  if (sessionLoading || !session) {
    return <FullscreenLoader label={slow ? "Server wacht gerade auf, das kann etwas dauern…" : "Einen Moment…"} />;
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
            <h1 className="text-lg font-bold text-slate-800">KI-Begleiter</h1>
            <p className="text-xs text-slate-500">
              Kein Ersatz für Therapie – bei akuten Krisen wende dich an professionelle Hilfe.
            </p>
          </div>
          {ttsSupported && (
            <button
              type="button"
              onClick={handleToggleTts}
              title={ttsEnabled ? "Vorlesen ausschalten" : "Antworten vorlesen"}
              className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full transition ${
                ttsEnabled ? "bg-brand-500 text-white shadow-soft" : "bg-sand-100 text-slate-500 hover:text-slate-700"
              }`}
            >
              {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
          {loadingHistory && <p className="text-sm text-slate-400">Lade Verlauf…</p>}
          {!loadingHistory && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
              <Sparkles className="h-8 w-8 text-brand-200" />
              <p className="max-w-xs text-sm">
                Schreib etwas, das dich gerade beschäftigt – ich bin da, um zuzuhören.
              </p>
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
                    alt="Angehängtes Bild"
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
                        <Square className="h-3 w-3" /> Stopp
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" /> Vorlesen
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
            <img src={pendingImage} alt="Ausgewähltes Bild" className="h-16 w-16 rounded-xl object-cover shadow-soft" />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white shadow-soft"
              aria-label="Bild entfernen"
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
            title="Bild anhängen"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          {sttSupported && (
            <button
              type="button"
              onClick={handleToggleListening}
              title={listening ? "Aufnahme stoppen" : "Nachricht per Sprache eingeben"}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-soft transition ${
                listening ? "bg-red-500 text-white" : "bg-white text-slate-500 hover:text-slate-700"
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Ich höre zu…" : "Schreib etwas…"}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm shadow-soft"
          />
          <button
            type="submit"
            disabled={sending || (!input.trim() && !pendingImage)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </main>

      {showVoicePrompt && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-slate-800">Welche Stimme soll Mira nutzen?</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Du kannst das jederzeit in den Einstellungen ändern.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip active={false} onClick={() => chooseVoiceGender("female")}>
                Weiblich
              </Chip>
              <Chip active={false} onClick={() => chooseVoiceGender("male")}>
                Männlich
              </Chip>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
