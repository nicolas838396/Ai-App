import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold text-brand-700">Deine mentale Gesundheit im Blick</h1>
      <p className="max-w-xl text-slate-600">
        Sprich mit deinem KI-Begleiter, tracke deine Stimmung, führe digitales Tagebuch und
        entdecke, was deine mentale Gesundheit wirklich beeinflusst.
      </p>
      <Link
        href="/login"
        className="rounded-full bg-brand-500 px-6 py-3 font-medium text-white transition hover:bg-brand-600"
      >
        Jetzt starten
      </Link>
    </main>
  );
}
