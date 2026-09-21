// A laurel wreath, generated procedurically as two mirrored arcs of leaves
// opening at the bottom — classic "award" framing for the medal it wraps
// around. Pure SVG so it renders identically in the live celebration
// overlay and in the rasterized share-card image.
export function buildBranchLeaves(side: "left" | "right", cx: number, cy: number, radius: number, count: number) {
  const startDeg = side === "left" ? 165 : 15;
  const endDeg = side === "left" ? 15 : 165;
  const sweep = side === "left" ? -1 : 1;
  const leaves = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const deg = startDeg + (endDeg - startDeg) * t;
    const rad = (deg * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy - radius * Math.sin(rad) * 0.72 + radius * 0.32;
    const tangentDeg = deg + 90 * sweep * -1;
    leaves.push({ x, y, rotate: tangentDeg, key: `${side}-${i}` });
  }
  return leaves;
}

export function LaurelWreath({ size = 200, color = "#c9a227" }: { size?: number; color?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;
  const leafW = size * 0.1;
  const leafH = size * 0.045;

  const leftLeaves = buildBranchLeaves("left", cx, cy, radius, 7);
  const rightLeaves = buildBranchLeaves("right", cx, cy, radius, 7);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {[...leftLeaves, ...rightLeaves].map((leaf) => (
        <ellipse
          key={leaf.key}
          cx={leaf.x}
          cy={leaf.y}
          rx={leafW}
          ry={leafH}
          fill={color}
          transform={`rotate(${leaf.rotate} ${leaf.x} ${leaf.y})`}
          opacity={0.92}
        />
      ))}
      {/* small berries at the base of each branch */}
      <circle cx={cx - radius * 0.97} cy={cy + radius * 0.32} r={size * 0.018} fill={color} />
      <circle cx={cx + radius * 0.97} cy={cy + radius * 0.32} r={size * 0.018} fill={color} />
    </svg>
  );
}
