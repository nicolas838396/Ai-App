// Which achievements the user has already seen unlocked, so we only ever
// show the celebration toast once per achievement. Purely a client-side
// preference like language/voice/theme — no backend field.
const KEY = "mira:unlocked-achievements";

export function getStoredUnlockedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function setStoredUnlockedIds(ids: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore (e.g. private browsing)
  }
}
