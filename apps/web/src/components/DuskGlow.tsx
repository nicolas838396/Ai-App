// The figure-free, reactive backdrop for real-time voice chat: a dark-blue-
// to-warm-amber gradient (an inverted sunset) that breathes on its own and
// pulses faster/stronger while the assistant is speaking. No mascot, no
// face — the visual itself carries the conversation's rhythm.

export type DuskGlowState = "idle" | "listening" | "thinking" | "speaking";

interface DuskGlowProps {
  state?: DuskGlowState;
  className?: string;
}

export function DuskGlow({ state = "idle", className = "" }: DuskGlowProps) {
  const horizonClass =
    state === "speaking"
      ? "dusk-glow-horizon-active"
      : state === "thinking"
        ? "dusk-glow-horizon-thinking"
        : "";

  return (
    <div className={`dusk-glow-stage ${className}`} aria-hidden="true">
      <div
        className="dusk-glow-blob dusk-glow-blob-a"
        style={{ width: 260, height: 260, left: -60, top: 40, background: "#2E3D8F", opacity: 0.5 }}
      />
      <div
        className="dusk-glow-blob dusk-glow-blob-b"
        style={{ width: 220, height: 220, right: -50, top: "26%", background: "#8A3E8F", opacity: 0.35 }}
      />
      <div
        className={`dusk-glow-blob dusk-glow-horizon ${horizonClass}`}
        style={{ width: 300, height: 300, bottom: -140, opacity: 0.8 }}
      />
    </div>
  );
}
