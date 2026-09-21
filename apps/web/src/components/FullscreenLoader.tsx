"use client";

import { Loader2 } from "lucide-react";

export function FullscreenLoader({ label = "Einen Moment…" }: { label?: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-hero-gradient px-6 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      <p className="text-sm text-slate-500">{label}</p>
    </main>
  );
}
