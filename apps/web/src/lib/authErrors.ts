// Supabase Auth returns its error messages only in English. We map the
// common ones to German so the user never sees raw English text; anything
// unrecognized falls back to a generic German message.
const KNOWN_ERRORS: { match: string; message: string }[] = [
  { match: "invalid login credentials", message: "E-Mail oder Passwort ist falsch." },
  {
    match: "email not confirmed",
    message: "Bitte bestätige zuerst deine E-Mail-Adresse – schau in dein Postfach.",
  },
  {
    match: "user already registered",
    message: "Für diese E-Mail-Adresse existiert bereits ein Konto. Bitte melde dich stattdessen an.",
  },
  {
    match: "email rate limit exceeded",
    message: "Es wurden zu viele E-Mails angefordert. Bitte warte ein paar Minuten und versuch es erneut.",
  },
  {
    match: "for security purposes",
    message: "Bitte warte kurz, bevor du es erneut versuchst.",
  },
  {
    match: "password should be at least",
    message: "Das Passwort muss mindestens 6 Zeichen lang sein.",
  },
  {
    match: "unable to validate email address",
    message: "Bitte gib eine gültige E-Mail-Adresse ein.",
  },
  {
    match: "signup is disabled",
    message: "Die Registrierung ist momentan nicht möglich. Bitte versuch es später erneut.",
  },
  {
    match: "network",
    message: "Keine Verbindung zum Server möglich. Bitte überprüfe deine Internetverbindung.",
  },
];

export function translateAuthError(message: string | undefined | null): string {
  const lower = (message ?? "").toLowerCase();
  const known = KNOWN_ERRORS.find((entry) => lower.includes(entry.match));
  return known?.message ?? "Etwas ist schiefgelaufen. Bitte versuch es erneut.";
}
