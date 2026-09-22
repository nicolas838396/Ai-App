"use client";

import Link from "next/link";
import { Moon, AudioLines, Wind, Heart, Package, Eraser } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

interface ThemeCard {
  icon: typeof Moon;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  href: string | null;
  colors: string; // full card background + text classes
}

const THEME_CARDS: ThemeCard[] = [
  {
    icon: Moon,
    titleKey: "relax.card.bedtimeStories.title",
    descKey: "relax.card.bedtimeStories.desc",
    href: "/relax/bedtime-stories",
    colors: "bg-slate-800 text-amber-50",
  },
  {
    icon: AudioLines,
    titleKey: "relax.card.sounds.title",
    descKey: "relax.card.sounds.desc",
    href: "/relax/sounds",
    colors: "bg-calm-100 text-calm-900",
  },
  {
    icon: Wind,
    titleKey: "relax.card.breathing.title",
    descKey: "relax.card.breathing.desc",
    href: "/relax/breathing",
    colors: "bg-sky-100 text-sky-900",
  },
  {
    icon: Heart,
    titleKey: "relax.card.gratitudeJar.title",
    descKey: "relax.card.gratitudeJar.desc",
    href: null,
    colors: "bg-rose-100 text-rose-900",
  },
  {
    icon: Package,
    titleKey: "relax.card.worryBox.title",
    descKey: "relax.card.worryBox.desc",
    href: null,
    colors: "bg-amber-100 text-amber-900",
  },
  {
    icon: Eraser,
    titleKey: "relax.card.brainDump.title",
    descKey: "relax.card.brainDump.desc",
    href: null,
    colors: "bg-brand-100 text-brand-900",
  },
];

function ThemeCardTile({ card, t }: { card: ThemeCard; t: (key: TranslationKey) => string }) {
  const Icon = card.icon;

  const inner = (
    <div className={`flex h-full flex-col rounded-3xl p-6 shadow-soft transition ${card.colors}`}>
      <Icon className="h-8 w-8" />
      <h2 className="mt-8 text-lg font-bold">{t(card.titleKey)}</h2>
      <p className="mt-1.5 text-sm leading-relaxed opacity-80">{t(card.descKey)}</p>
      {!card.href && (
        <span className="mt-4 inline-flex w-fit items-center rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">
          {t("relax.comingSoon")}
        </span>
      )}
    </div>
  );

  if (card.href) {
    return (
      <Link href={card.href} className="block h-full transition hover:-translate-y-0.5 hover:shadow-glow">
        {inner}
      </Link>
    );
  }

  return (
    <div className="block h-full cursor-default opacity-90" aria-disabled="true">
      {inner}
    </div>
  );
}

export default function RelaxPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <div>
          <h1 className="text-2xl">{t("relax.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("relax.subtitle")}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {THEME_CARDS.map((card) => (
            <ThemeCardTile key={card.titleKey} card={card} t={t} />
          ))}
        </div>
      </main>
    </>
  );
}
