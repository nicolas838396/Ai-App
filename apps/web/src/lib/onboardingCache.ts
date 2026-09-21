// Once we've confirmed a user's onboarding is complete, there's no reason to
// hit the backend again on every page navigation within the same browser
// tab — that turned a simple click into a multi-second (or, on a cold
// Render instance, tens-of-seconds) round trip every single time. We cache
// the result per user in sessionStorage so subsequent navigations are
// instant; it's cleared automatically when the tab closes.
function key(userId: string) {
  return `mira:onboarding-complete:${userId}`;
}

export function isOnboardingCachedComplete(userId: string): boolean {
  try {
    return sessionStorage.getItem(key(userId)) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingComplete(userId: string) {
  try {
    sessionStorage.setItem(key(userId), "1");
  } catch {
    // Storage unavailable (e.g. private browsing) — just skip caching.
  }
}
