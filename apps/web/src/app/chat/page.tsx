"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const result = await apiFetch<{ conversationId: string; message: ChatMessage }>(
        "/chat/message",
        { method: "POST", body: JSON.stringify({ conversationId, content }) },
      );
      setConversationId(result.conversationId);
      setMessages((prev) => [...prev, result.message]);
    } catch {
      setError("Nachricht konnte nicht gesendet werden. Bitte versuch es erneut.");
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
                {message.content}
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

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreib etwas…"
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm shadow-soft"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </main>
    </>
  );
}
