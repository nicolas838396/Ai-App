"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { BreathingExercise } from "@/components/BreathingExercise";
import { useSession } from "@/lib/useSession";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BreathingPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <Link href="/relax" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          {t("relax.backToThemes")}
        </Link>

        <div>
          <h1 className="text-2xl">{t("relax.breathingTitle")}</h1>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <BreathingExercise />
        </section>
      </main>
    </>
  );
}
