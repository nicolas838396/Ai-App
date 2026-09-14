"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AppNav } from "@/components/AppNav";
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
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
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

  if (sessionLoading) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex max-w-2xl flex-col px-6 py-8" style={{ height: "calc(100vh - 65px)" }}>
        <h1 className="text-xl font-semibold text-brand-700">KI-Begleiter</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ein Gespräch, kein Ersatz für Therapie. Bei akuten Krisen wende dich bitte an professionelle Hilfe.
        </p>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
          {loadingHistory && <p className="text-sm text-slate-400">Lade Verlauf…</p>}
          {!loadingHistory && messages.length === 0 && (
            <p className="text-sm text-slate-400">
              Schreib etwas, das dich gerade beschäftigt – ich bin da, um zuzuhören.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "ml-auto bg-brand-500 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {message.content}
            </div>
          ))}
          {sending && <p className="text-sm text-slate-400">Der Begleiter tippt…</p>}
          <div ref={bottomRef} />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreib etwas…"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Senden
          </button>
        </form>
      </main>
    </>
  );
}
