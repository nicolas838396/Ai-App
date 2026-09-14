"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold text-brand-700">
        {mode === "login" ? "Anmelden" : "Konto erstellen"}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-brand-700">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "..." : mode === "login" ? "Anmelden" : "Registrieren"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
          setInfo(null);
        }}
        className="text-sm text-slate-500 underline hover:text-slate-700"
      >
        {mode === "login" ? "Noch kein Konto? Registrieren" : "Schon ein Konto? Anmelden"}
      </button>
      <p className="text-xs text-slate-400">Passwort-Reset & Social-Login folgen als eigene Aufgabe.</p>
    </main>
  );
}
