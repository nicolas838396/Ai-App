"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { translateAuthError } from "@/lib/authErrors";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);

    if (mode === "login") {
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(translateAuthError(signInError.message, language));
        return;
      }
      router.push("/dashboard");
      return;
    }

    if (!firstName.trim() || !birthDate) {
      setError(t("login.missingNameOrBirth"));
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { firstName: firstName.trim(), birthDate } },
    });
    setLoading(false);
    if (signUpError) {
      setError(translateAuthError(signUpError.message, language));
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      return;
    }
    setInfo(t("login.confirmEmailSent"));
    setMode("login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-soft ring-1 ring-black/5 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="text-2xl">{mode === "login" ? t("login.welcomeBack") : t("login.createAccount")}</h1>
          <p className="text-sm text-slate-500">
            {mode === "login" ? t("login.subtitleLogin") : t("login.subtitleRegister")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          {mode === "register" && (
            <>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={t("login.firstNamePlaceholder")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm"
                />
              </div>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  value={birthDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm"
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              placeholder={t("login.emailPlaceholder")}
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
              placeholder={t("login.passwordPlaceholder")}
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
            {loading ? "…" : mode === "login" ? t("login.submitLogin") : t("login.submitRegister")}
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
          {mode === "login" ? t("login.toggleToRegister") : t("login.toggleToLogin")}
        </button>

        <Link href="/" className="mt-3 block text-center text-xs text-slate-400 hover:text-slate-500">
          {t("login.backToHome")}
        </Link>
      </div>
    </main>
  );
}
