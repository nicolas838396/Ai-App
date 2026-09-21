// A warm, schematic illustration of two people talking, standing in for a
// photo-realistic hero image (this environment has no image-generation
// tool available). Built as inline SVG so the primary figure's color
// follows the user's chosen color theme via the same `fill-brand-*`
// Tailwind utilities used everywhere else in the app.
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 320" className={className} role="img" aria-hidden="true">
      {/* soft ground shadow */}
      <ellipse cx="240" cy="282" rx="190" ry="22" className="fill-sand-200" opacity={0.7} />

      {/* floating sparkle accents */}
      <path
        d="M 60 70 L 66 84 L 80 90 L 66 96 L 60 110 L 54 96 L 40 90 L 54 84 Z"
        className="fill-brand-200"
      />
      <path
        d="M 420 50 L 424 60 L 434 64 L 424 68 L 420 78 L 416 68 L 406 64 L 416 60 Z"
        className="fill-calm-200"
      />
      <circle cx="410" cy="120" r="5" className="fill-brand-300" />
      <circle cx="45" cy="160" r="4" className="fill-calm-300" />

      {/* connecting speech bubble */}
      <g transform="translate(196, 40)">
        <rect x="0" y="0" width="88" height="52" rx="22" className="fill-brand-500" />
        <path d="M 30 50 L 22 66 L 44 50 Z" className="fill-brand-500" />
        <circle cx="28" cy="26" r="6" className="fill-white" />
        <circle cx="44" cy="26" r="6" className="fill-white" opacity={0.85} />
        <circle cx="60" cy="26" r="6" className="fill-white" opacity={0.7} />
      </g>

      {/* Person A (left) */}
      <g>
        <rect x="70" y="205" width="130" height="66" rx="33" className="fill-brand-300" />
        <rect x="98" y="132" width="76" height="96" rx="36" className="fill-brand-400" />
        <line x1="168" y1="165" x2="205" y2="188" strokeWidth="20" strokeLinecap="round" className="stroke-brand-400" />
        <circle cx="212" cy="192" r="11" className="fill-brand-400" />
        <circle cx="136" cy="108" r="34" className="fill-sand-200" />
        <path d="M 104 100 A 34 34 0 0 1 168 96 Q 150 82 136 86 Q 118 82 104 100 Z" className="fill-brand-700" />
        <circle cx="126" cy="110" r="3.5" className="fill-slate-700" />
        <circle cx="146" cy="110" r="3.5" className="fill-slate-700" />
        <path d="M 122 122 Q 136 132 150 122" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-slate-700" />
      </g>

      {/* Person B (right) */}
      <g>
        <rect x="280" y="205" width="130" height="66" rx="33" className="fill-calm-300" />
        <rect x="306" y="132" width="76" height="96" rx="36" className="fill-calm-400" />
        <line x1="312" y1="165" x2="275" y2="188" strokeWidth="20" strokeLinecap="round" className="stroke-calm-400" />
        <circle cx="268" cy="192" r="11" className="fill-calm-400" />
        <circle cx="344" cy="108" r="34" className="fill-sand-200" />
        <path
          d="M 312 96 Q 344 68 376 96 Q 378 112 372 108 Q 344 88 316 108 Q 310 112 312 96 Z"
          className="fill-calm-700"
        />
        <circle cx="334" cy="110" r="3.5" className="fill-slate-700" />
        <circle cx="354" cy="110" r="3.5" className="fill-slate-700" />
        <path d="M 330 122 Q 344 132 358 122" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-slate-700" />
      </g>
    </svg>
  );
}
