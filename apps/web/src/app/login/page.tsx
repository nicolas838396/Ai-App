"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push("/dashboard");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      return;
    }
    setInfo("Konto erstellt. Falls eine Bestätigungs-E-Mail nötig ist, prüf dein Postfach und melde dich danach an.");
    setMode("login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-soft ring-1 ring-black/5 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="text-2xl">{mode === "login" ? "Willkommen zurück" : "Konto erstellen"}</h1>
          <p className="text-sm text-slate-500">
            {mode === "login" ? "Schön, dass du wieder da bist." : "Schön, dass du dabei bist."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-brand-700">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-xl bg-brand-500 py-2.5 font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? "…" : mode === "login" ? "Anmelden" : "Registrieren"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 w-full text-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {mode === "login" ? "Noch kein Konto? Registrieren" : "Schon ein Konto? Anmelden"}
        </button>

        <Link
          href="/"
          className="mt-3 block text-center text-xs text-slate-400 hover:text-slate-500"
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
