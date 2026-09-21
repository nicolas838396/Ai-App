// A carrier pigeon delivering a letter, in the same flat illustration
// style as HeroIllustration (feathers follow the color theme; beak/legs
// stay a fixed natural tone). Animated via CSS: the whole bird gently
// bobs, the wing flaps. Keyframes are defined in globals.css.
export function PigeonIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} role="img" aria-hidden="true">
      {/* soft clouds */}
      <ellipse cx="40" cy="50" rx="26" ry="14" className="fill-sand-100" />
      <ellipse cx="60" cy="42" rx="18" ry="11" className="fill-sand-100" />
      <ellipse cx="205" cy="150" rx="24" ry="13" className="fill-sand-100" />
      <ellipse cx="222" cy="158" rx="16" ry="9" className="fill-sand-100" />

      {/* sparkle accents */}
      <path d="M 30 130 L 33 138 L 41 141 L 33 144 L 30 152 L 27 144 L 19 141 L 27 138 Z" className="fill-brand-200" />
      <circle cx="200" cy="70" r="4" className="fill-calm-300" />

      <g className="pigeon-bob">
        {/* tail */}
        <path d="M 84 118 L 55 128 L 86 132 Z" className="fill-brand-400" />

        {/* legs (dangling) */}
        <path d="M 112 138 Q 110 152 104 160" fill="none" strokeWidth="2.5" strokeLinecap="round" stroke="#e08a2e" />
        <path d="M 130 140 Q 130 154 126 162" fill="none" strokeWidth="2.5" strokeLinecap="round" stroke="#e08a2e" />
        <path d="M 100 160 L 108 160 M 100 160 L 104 165" stroke="#e08a2e" strokeWidth="2" strokeLinecap="round" />
        <path d="M 122 162 L 130 162 M 126 162 L 130 167" stroke="#e08a2e" strokeWidth="2" strokeLinecap="round" />

        {/* body */}
        <ellipse cx="120" cy="112" rx="42" ry="34" className="fill-brand-300" />

        {/* wing */}
        <path
          d="M 108 92 C 90 96 74 112 78 136 C 96 130 114 116 116 96 Z"
          className="fill-brand-500 pigeon-wing"
          style={{ transformOrigin: "108px 96px" }}
        />

        {/* head */}
        <circle cx="156" cy="80" r="23" className="fill-brand-400" />
        <circle cx="164" cy="75" r="3" fill="#1e293b" />
        <circle cx="165.3" cy="73.7" r="1" fill="white" />

        {/* beak */}
        <path d="M 176 82 L 194 78 L 177 90 Z" fill="#f2a93b" />

        {/* letter, held just behind the beak */}
        <g transform="translate(150,86) rotate(-8)">
          <rect x="0" y="0" width="38" height="26" rx="3" fill="white" stroke="#dcd5c8" strokeWidth="1.5" />
          <path d="M 1 2 L 19 15 L 37 2" fill="none" stroke="#dcd5c8" strokeWidth="1.5" />
          <circle cx="19" cy="17" r="5.5" className="fill-calm-500" />
        </g>
      </g>
    </svg>
  );
}
