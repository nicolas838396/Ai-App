"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { useSession } from "@/lib/useSession";

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
}

const FEATURE_CARDS = [
  { title: "KI-Begleiter", description: "Chat mit deinem KI-Begleiter.", href: "/chat" },
  {
    title: "Tagebuch",
    description: "Stimmung, Gewohnheiten & Gedanken festhalten.",
    href: "/journal",
  },
  { title: "Entspannung", description: "Beruhigende Klänge & Atemübung.", href: "/relax" },
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
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-brand-700">Übersicht</h1>

        <div className="mt-2 text-sm text-slate-500">
          {error && <span className="text-red-600">{error}</span>}
          {health && (
            <span>
              Backend: {health.status} · DB: {health.db} · {new Date(health.timestamp).toLocaleTimeString()}
            </span>
          )}
          {!health && !error && <span>Prüfe Backend-Verbindung…</span>}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURE_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300"
            >
              <h2 className="font-medium text-brand-700">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
