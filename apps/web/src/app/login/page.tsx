"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { translateAuthError } from "@/lib/authErrors";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useColorTheme } from "@/lib/ColorThemeContext";
import { ColorThemePicker } from "@/components/ColorThemePicker";
import { PigeonIllustration } from "@/components/PigeonIllustration";
import { GoogleIcon, AppleIcon } from "@/components/icons/OAuthIcons";

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mode, setMode] = useState<"login" | "register" | "confirmEmail">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  async function handleOAuthSignIn(provider: "google" | "apple") {
    setError(null);
    setOauthLoading(provider);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (oauthError) {
      setError(translateAuthError(oauthError.message, language));
      setOauthLoading(null);
    }
    // On success the browser navigates away to the provider's consent
    // screen, so there's nothing further to do here.
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError(null);

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
    setMode("confirmEmail");
  }

  if (mode === "confirmEmail") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-6">
        <div className="w-full max-w-sm rounded-3xl bg-white/90 p-8 text-center shadow-soft ring-1 ring-black/5 backdrop-blur-sm">
          <PigeonIllustration className="mx-auto w-48" />
          <h1 className="mt-2 text-xl">{t("login.confirmEmailTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {t("login.confirmEmailBody", { email })}
          </p>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="mt-6 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
          >
            {t("login.confirmEmailBackToLogin")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-6">
      <div
        className={`w-full rounded-3xl bg-white/90 p-8 shadow-soft ring-1 ring-black/5 backdrop-blur-sm transition-all ${
          mode === "register" ? "max-w-lg" : "max-w-sm"
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="text-2xl">{mode === "login" ? t("login.welcomeBack") : t("login.createAccount")}</h1>
          <p className="text-sm text-slate-500">
            {mode === "login" ? t("login.subtitleLogin") : t("login.subtitleRegister")}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-soft transition hover:bg-slate-50 disabled:opacity-50"
          >
            <GoogleIcon className="h-4 w-4" />
            {oauthLoading === "google" ? "…" : t("login.continueWithGoogle")}
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignIn("apple")}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:opacity-50"
          >
            <AppleIcon className="h-4 w-4" />
            {oauthLoading === "apple" ? "…" : t("login.continueWithApple")}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          {t("login.orDivider")}
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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

              <div className="pt-1">
                <h2 className="text-sm font-bold text-slate-700">{t("theme.pickerTitle")}</h2>
                <p className="text-xs text-slate-400">{t("theme.pickerSubtitle")}</p>
                <div className="mt-3">
                  <ColorThemePicker value={colorTheme} onChange={setColorTheme} />
                </div>
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
