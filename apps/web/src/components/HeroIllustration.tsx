// A warm illustration of two people talking, standing in for a photo (this
// environment has no image-generation tool available). Hand-built inline
// SVG in a flat, friendly character-illustration style. Clothing colors
// follow the user's chosen theme via `fill-brand-*`/`fill-calm-*`; skin,
// hair, and the bench stay fixed, natural tones regardless of theme.
export function HeroIllustration({ className }: { className?: string }) {
  const SKIN_A = "#f0c9a0";
  const SKIN_B = "#c9875a";
  const HAIR_A = "#6b4530";
  const HAIR_B = "#241d1a";

  return (
    <svg viewBox="0 0 480 300" className={className} role="img" aria-hidden="true">
      <ellipse cx="240" cy="280" rx="185" ry="14" className="fill-sand-200" opacity={0.6} />

      {/* sparkle accents */}
      <path d="M 52 66 L 57 78 L 69 83 L 57 88 L 52 100 L 47 88 L 35 83 L 47 78 Z" className="fill-brand-200" />
      <path d="M 428 46 L 431 55 L 440 58 L 431 61 L 428 70 L 425 61 L 416 58 L 425 55 Z" className="fill-calm-200" />
      <circle cx="418" cy="110" r="5" className="fill-brand-300" />
      <circle cx="38" cy="150" r="4" className="fill-calm-300" />

      {/* speech bubble */}
      <g transform="translate(198, 6)">
        <rect x="0" y="0" width="84" height="48" rx="20" className="fill-brand-500" />
        <path d="M 28 46 L 21 61 L 42 46 Z" className="fill-brand-500" />
        <circle cx="26" cy="24" r="5.5" className="fill-white" />
        <circle cx="42" cy="24" r="5.5" className="fill-white" opacity={0.85} />
        <circle cx="58" cy="24" r="5.5" className="fill-white" opacity={0.7} />
      </g>

      {/* bench */}
      <rect x="70" y="204" width="340" height="18" rx="9" fill="#b08c5c" />
      <rect x="66" y="192" width="348" height="22" rx="11" fill="#c9a876" />

      {/* ---------- Person A (left) ---------- */}
      <g>
        {/* legs */}
        <path d="M 140 196 Q 146 230 140 266" fill="none" strokeWidth="17" strokeLinecap="round" className="stroke-slate-600" />
        <path d="M 160 196 Q 166 230 160 266" fill="none" strokeWidth="17" strokeLinecap="round" className="stroke-slate-600" />
        <ellipse cx="140" cy="270" rx="13" ry="7" fill="#1e293b" />
        <ellipse cx="160" cy="270" rx="13" ry="7" fill="#1e293b" />

        {/* resting arm */}
        <path d="M 124 124 Q 116 150 126 178" fill="none" strokeWidth="15" strokeLinecap="round" className="stroke-brand-400" />
        <circle cx="126" cy="180" r="9" fill={SKIN_A} />

        {/* torso */}
        <rect x="120" y="112" width="60" height="82" rx="26" className="fill-brand-400" />
        <rect x="156" y="118" width="24" height="76" rx="18" fill="#000000" opacity={0.08} />
        <path d="M 140 116 Q 150 126 160 116" fill="none" strokeWidth="3" opacity={0.5} className="stroke-brand-700" />

        {/* gesture arm (reaching toward Person B) */}
        <path d="M 176 124 Q 205 132 216 150" fill="none" strokeWidth="15" strokeLinecap="round" className="stroke-brand-400" />
        <circle cx="218" cy="152" r="9" fill={SKIN_A} />

        {/* neck + head */}
        <rect x="141" y="100" width="18" height="18" rx="6" fill={SKIN_A} />
        <ellipse cx="150" cy="76" rx="26" ry="28" fill={SKIN_A} />

        {/* hair (shoulder-length, side part) */}
        <path
          d="M 123 70 C 120 40 134 24 150 24 C 166 24 180 38 179 66 C 179 80 172 76 170 64 C 166 46 134 44 128 62 C 126 68 125 76 123 70 Z"
          fill={HAIR_A}
        />
        <path d="M 128 60 Q 140 50 150 52" fill="none" strokeWidth="2" opacity={0.35} stroke="#3d2818" strokeLinecap="round" />

        {/* face */}
        <path d="M 136 68 Q 141 64 146 68" fill="none" strokeWidth="2" className="stroke-slate-700" strokeLinecap="round" />
        <path d="M 154 68 Q 159 64 164 68" fill="none" strokeWidth="2" className="stroke-slate-700" strokeLinecap="round" />
        <ellipse cx="141" cy="76" rx="3" ry="4" className="fill-slate-800" />
        <ellipse cx="159" cy="76" rx="3" ry="4" className="fill-slate-800" />
        <circle cx="142.2" cy="74.5" r="1" fill="white" />
        <circle cx="160.2" cy="74.5" r="1" fill="white" />
        <ellipse cx="131" cy="86" rx="6" ry="4" fill="#ff8a65" opacity={0.25} />
        <ellipse cx="169" cy="86" rx="6" ry="4" fill="#ff8a65" opacity={0.25} />
        <path d="M 142 92 Q 150 99 158 92" fill="none" strokeWidth="2.5" className="stroke-slate-700" strokeLinecap="round" />
      </g>

      {/* ---------- Person B (right) ---------- */}
      <g>
        {/* legs */}
        <path d="M 320 196 Q 314 230 320 266" fill="none" strokeWidth="17" strokeLinecap="round" className="stroke-slate-600" />
        <path d="M 340 196 Q 334 230 340 266" fill="none" strokeWidth="17" strokeLinecap="round" className="stroke-slate-600" />
        <ellipse cx="320" cy="270" rx="13" ry="7" fill="#1e293b" />
        <ellipse cx="340" cy="270" rx="13" ry="7" fill="#1e293b" />

        {/* resting arm */}
        <path d="M 356 124 Q 364 150 354 178" fill="none" strokeWidth="15" strokeLinecap="round" className="stroke-calm-400" />
        <circle cx="354" cy="180" r="9" fill={SKIN_B} />

        {/* torso */}
        <rect x="300" y="112" width="60" height="82" rx="26" className="fill-calm-400" />
        <rect x="300" y="118" width="24" height="76" rx="18" fill="#000000" opacity={0.08} />
        <path d="M 320 116 Q 330 126 340 116" fill="none" strokeWidth="3" opacity={0.5} className="stroke-calm-700" />

        {/* gesture arm (reaching toward Person A) */}
        <path d="M 304 124 Q 275 132 264 150" fill="none" strokeWidth="15" strokeLinecap="round" className="stroke-calm-400" />
        <circle cx="262" cy="152" r="9" fill={SKIN_B} />

        {/* neck + head */}
        <rect x="321" y="100" width="18" height="18" rx="6" fill={SKIN_B} />
        <ellipse cx="330" cy="76" rx="26" ry="28" fill={SKIN_B} />

        {/* hair (short, cropped) */}
        <path
          d="M 304 66 C 303 40 316 22 330 22 C 344 22 357 40 356 66 C 350 54 340 50 330 50 C 320 50 310 54 304 66 Z"
          fill={HAIR_B}
        />
        <path d="M 312 40 Q 330 30 348 40" fill="none" strokeWidth="2" opacity={0.35} stroke="#000" strokeLinecap="round" />

        {/* face */}
        <path d="M 316 68 Q 321 64 326 68" fill="none" strokeWidth="2" className="stroke-slate-700" strokeLinecap="round" />
        <path d="M 334 68 Q 339 64 344 68" fill="none" strokeWidth="2" className="stroke-slate-700" strokeLinecap="round" />
        <ellipse cx="321" cy="76" rx="3" ry="4" className="fill-slate-800" />
        <ellipse cx="339" cy="76" rx="3" ry="4" className="fill-slate-800" />
        <circle cx="322.2" cy="74.5" r="1" fill="white" />
        <circle cx="340.2" cy="74.5" r="1" fill="white" />
        <ellipse cx="311" cy="86" rx="6" ry="4" fill="#ff8a65" opacity={0.25} />
        <ellipse cx="349" cy="86" rx="6" ry="4" fill="#ff8a65" opacity={0.25} />
        <path d="M 322 92 Q 330 99 338 92" fill="none" strokeWidth="2.5" className="stroke-slate-700" strokeLinecap="round" />
      </g>
    </svg>
  );
}
