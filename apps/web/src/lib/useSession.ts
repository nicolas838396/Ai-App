"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { apiFetch } from "./apiClient";

interface UseSessionOptions {
  requireAuth?: boolean;
  /** Skip the onboarding-completed check — used by the onboarding page itself. */
  skipOnboardingCheck?: boolean;
}

export function useSession(options: UseSessionOptions = {}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

      if (newSession && options.requireAuth && !options.skipOnboardingCheck) {
        try {
          const profile = await apiFetch<{ onboardingCompletedAt: string | null }>("/users/me");
          if (cancelled) return;
          if (!profile.onboardingCompletedAt) {
            setLoading(false);
            router.replace("/onboarding");
            return;
          }
        } catch {
          // If the check itself fails (e.g. transient network issue), don't
          // trap the user — let them through rather than looping forever.
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

  return { session, loading };
}
