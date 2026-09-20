"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircleHeart, NotebookPen, Wind, CircleCheck, CircleAlert } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useSession } from "@/lib/useSession";

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
}

const FEATURE_CARDS = [
  {
    icon: MessageCircleHeart,
    title: "KI-Begleiter",
    description: "Chat mit deinem KI-Begleiter.",
    href: "/chat",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: NotebookPen,
    title: "Tagebuch",
    description: "Stimmung, Gewohnheiten & Gedanken festhalten.",
    href: "/journal",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Wind,
    title: "Entspannung",
    description: "Beruhigende Klänge & Atemübung.",
    href: "/relax",
    color: "bg-calm-50 text-calm-600",
  },
];

export default function DashboardPage() {
  const { loading: sessionLoading } = useSession({ requireAuth: true });
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError("Backend nicht erreichbar"));
  }, []);

  if (sessionLoading) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl">Schön, dich zu sehen 👋</h1>
        <p className="mt-1 text-slate-500">Was möchtest du heute machen?</p>

        <div
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            error
              ? "bg-red-50 text-red-600"
              : health
                ? "bg-brand-50 text-brand-700"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {error ? (
            <CircleAlert className="h-3.5 w-3.5" />
          ) : (
            <CircleCheck className="h-3.5 w-3.5" />
          )}
          {error ?? (health ? `Alles verbunden · ${new Date(health.timestamp).toLocaleTimeString()}` : "Prüfe Verbindung…")}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-bold text-slate-800">{card.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{card.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
