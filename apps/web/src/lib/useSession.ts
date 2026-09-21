"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { apiFetch } from "./apiClient";
import { isOnboardingCachedComplete, markOnboardingComplete } from "./onboardingCache";

interface UseSessionOptions {
  requireAuth?: boolean;
  /** Skip the onboarding-completed check — used by the onboarding page itself. */
  skipOnboardingCheck?: boolean;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Reads the Supabase session straight out of localStorage, synchronously.
// supabase-js only exposes this via an async getSession() call — fine
// normally, but awaiting even a microtask means every page mount starts by
// rendering the loading state at least once, which shows up as a visible
// flash on every navigation between already-visited pages. Using this for
// the hook's *initial* state lets an already-authenticated, already-
// onboarded revisit skip the loading screen entirely; the real async check
// below still runs right after to confirm (or correct) the guess.
function readStoredSessionSync(): Session | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return null;
    const ref = new URL(url).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { access_token?: string; expires_at?: number };
    if (!parsed.access_token || !parsed.expires_at) return null;
    if (parsed.expires_at * 1000 < Date.now()) return null;
    return parsed as unknown as Session;
  } catch {
    return null;
  }
}

function computeInitialState(options: UseSessionOptions): { session: Session | null; loading: boolean } {
  if (typeof window === "undefined") return { session: null, loading: true };
  const stored = readStoredSessionSync();
  if (!options.requireAuth) return { session: stored, loading: false };
  // Whether onboarding is complete is confirmed separately, in the background,
  // and must never block the page from rendering — the check hits our own
  // backend, which can take tens of seconds to wake up from a cold start on
  // Render's free tier. A cached, unexpired session is reason enough to show
  // the page immediately; onboarding.completedAt is only used afterwards to
  // decide whether to redirect away from it.
  return { session: stored, loading: !stored };
}

// Render's free tier spins the API down after inactivity; the first request
// after a deploy or idle period can take up to ~50s to wake it back up. A
// single failed check here shouldn't let someone through onboarding
// permanently, so retry with backoff before giving up.
async function fetchProfileWithRetries(): Promise<{ onboardingCompletedAt: string | null }> {
  const delaysMs = [0, 3000, 8000, 15000];
  let lastError: unknown;
  for (const delay of delaysMs) {
    if (delay > 0) await sleep(delay);
    try {
      return await apiFetch<{ onboardingCompletedAt: string | null }>("/users/me");
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export function useSession(options: UseSessionOptions = {}) {
  const router = useRouter();
  const [initial] = useState(() => computeInitialState(options));
  const [session, setSession] = useState<Session | null>(initial.session);
  const [loading, setLoading] = useState(initial.loading);

  useEffect(() => {
    let cancelled = false;

    async function handleSession(newSession: Session | null) {
      if (cancelled) return;
      setSession(newSession);

      if (options.requireAuth && !newSession) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      // Once we know whether there's a session, stop blocking the page —
      // the onboarding-completeness check below runs against our own
      // backend (slow on a cold Render start) and must never hold up
      // rendering. It only redirects away afterwards if it turns out
      // onboarding genuinely isn't done.
      setLoading(false);

      if (
        newSession &&
        options.requireAuth &&
        !options.skipOnboardingCheck &&
        !isOnboardingCachedComplete(newSession.user.id)
      ) {
        try {
          const profile = await fetchProfileWithRetries();
          if (cancelled) return;
          if (!profile.onboardingCompletedAt) {
            router.replace("/onboarding");
            return;
          }
          markOnboardingComplete(newSession.user.id);
        } catch {
          // If the check still fails after retries (e.g. a genuine outage),
          // don't trap the user — let them through rather than looping
          // forever on a backend that may be down.
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      handleSession(newSession);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { session, loading };
}
