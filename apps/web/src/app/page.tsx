import Link from "next/link";
import { MessageCircleHeart, NotebookPen, Wind, Sparkles, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: MessageCircleHeart,
    title: "KI-Begleiter",
    description: "Sprich über das, was dich bewegt – einfühlsam, jederzeit erreichbar, ohne Wartezeit.",
  },
  {
    icon: NotebookPen,
    title: "Tägliches Ritual",
    description: "Stimmung, Gewohnheiten und Gedanken an einem Ort – in wenigen Minuten am Tag.",
  },
  {
    icon: Sparkles,
    title: "Muster erkennen",
    description: "Sieh, was deine Stimmung wirklich beeinflusst – Schlaf, Bewegung, soziale Kontakte.",
  },
  {
    icon: Wind,
    title: "Entspannung",
    description: "Beruhigende Klänge und eine geführte Atemübung, wenn es gerade zu viel wird.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-hero-gradient">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold text-slate-800">Mira</span>
        </div>
        <Link
          href="/login"
          className="rounded-full px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          Anmelden
        </Link>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-20 pt-10 text-center sm:pb-28 sm:pt-16">
        <span className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-soft ring-1 ring-brand-100">
          Deine mentale Gesundheit, jeden Tag ein bisschen besser
        </span>
        <h1 className="text-4xl leading-tight sm:text-5xl">
          Mehr Klarheit über dich selbst – <span className="text-brand-600">Schritt für Schritt</span>
        </h1>
        <p className="max-w-xl text-lg text-slate-600">
          Sprich mit deinem KI-Begleiter, tracke Stimmung und Gewohnheiten, führe digitales Tagebuch
          und entdecke, was dir wirklich guttut.
        </p>
        <Link
          href="/login"
          className="group flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 font-semibold text-white shadow-soft transition hover:bg-brand-600"
        >
          Jetzt starten
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white/80 p-6 shadow-soft ring-1 ring-black/5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <feature.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-bold text-slate-800">{feature.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-center text-xs text-slate-400">
        Mira ersetzt keine Therapie. Bei akuten Krisen wende dich bitte an professionelle Hilfe.
      </footer>
    </main>
  );
}
