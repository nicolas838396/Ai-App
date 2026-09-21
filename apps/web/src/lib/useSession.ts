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

// Render's free tier spins the API down after inactivity; the first request
// after a deploy or idle period can take up to ~50s to wake it back up. A
// single failed check here shouldn't let someone through onboarding
// permanently, so retry with backoff before giving up.
async function fetchProfileWithRetries(
  onSlow: () => void,
): Promise<{ onboardingCompletedAt: string | null }> {
  const delaysMs = [0, 3000, 8000, 15000];
  let lastError: unknown;
  for (const [index, delay] of delaysMs.entries()) {
    if (index === 1) onSlow();
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);

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

      if (
        newSession &&
        options.requireAuth &&
        !options.skipOnboardingCheck &&
        !isOnboardingCachedComplete(newSession.user.id)
      ) {
        try {
          const profile = await fetchProfileWithRetries(() => {
            if (!cancelled) setSlow(true);
          });
          if (cancelled) return;
          if (!profile.onboardingCompletedAt) {
            setLoading(false);
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

      if (!cancelled) setLoading(false);
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

  return { session, loading, slow };
}
