"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
}

const FEATURE_CARDS = [
  { title: "KI-Begleiter", description: "Chat mit deinem KI-Begleiter." },
  { title: "Stimmungs-Tracking", description: "Erfasse täglich, wie es dir geht." },
  { title: "Digitales Tagebuch", description: "Halte Gedanken und Erlebnisse fest." },
  { title: "Aktivitäten & Einflüsse", description: "Erkenne, was deine Stimmung beeinflusst." },
];

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError("Backend nicht erreichbar"));
  }, []);

  return (
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
          <div key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-medium text-brand-700">{card.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{card.description}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Coming soon</p>
          </div>
        ))}
      </div>
    </main>
  );
}
