"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dailyMoodAverages, type MoodEntryLite } from "@/lib/moodAnalytics";

const CHART_W = 300;
const CHART_H = 120;
const PAD_TOP = 10;
const PAD_BOTTOM = 10;

function scoreToY(score: number): number {
  const t = (score - 1) / 9; // 1..10 -> 0..1
  return CHART_H - PAD_BOTTOM - t * (CHART_H - PAD_TOP - PAD_BOTTOM);
}

export function MoodTrendChart({ entries }: { entries: MoodEntryLite[] }) {
  const { t, language } = useLanguage();
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const days = useMemo(() => dailyMoodAverages(entries, range), [entries, range]);
  const hasAnyData = days.some((d) => d.avg !== null);

  const points = days.map((d, i) => ({
    x: (i / Math.max(1, days.length - 1)) * CHART_W,
    y: d.avg !== null ? scoreToY(d.avg) : null,
    avg: d.avg,
    date: d.date,
  }));

  // Split into contiguous segments so gaps (no entry that day) don't draw a
  // misleading straight line across days with no data.
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (const p of points) {
    if (p.y === null) {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push({ x: p.x, y: p.y });
    }
  }
  if (current.length) segments.push(current);

  const linePath = segments.map((seg) => "M " + seg.map((p) => `${p.x},${p.y}`).join(" L ")).join(" ");
  const areaPath = segments
    .map((seg) => {
      const baseline = CHART_H - PAD_BOTTOM;
      const line = seg.map((p) => `${p.x},${p.y}`).join(" L ");
      return `M ${seg[0].x},${baseline} L ${line} L ${seg[seg.length - 1].x},${baseline} Z`;
    })
    .join(" ");

  const locale = language === "en" ? "en-US" : "de-DE";
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.max(0, Math.min(points.length - 1, index)));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{t("analytics.trendTitle")}</h3>
        <div className="flex gap-1 rounded-full bg-sand-100 p-0.5">
          {([7, 30, 90] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                range === r ? "bg-white text-brand-700 shadow-soft" : "text-slate-500"
              }`}
            >
              {r === 7 ? t("analytics.trend7d") : r === 30 ? t("analytics.trend30d") : t("analytics.trend3m")}
            </button>
          ))}
        </div>
      </div>

      {!hasAnyData ? (
        <p className="mt-6 text-sm text-slate-400">{t("analytics.trendEmpty")}</p>
      ) : (
        <div className="relative mt-3">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full"
            style={{ height: 140 }}
            preserveAspectRatio="none"
          >
            {[1, 5.5, 10].map((score) => (
              <line
                key={score}
                x1={0}
                x2={CHART_W}
                y1={scoreToY(score)}
                y2={scoreToY(score)}
                stroke="#ece5d4"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={areaPath} className="fill-brand-500" fillOpacity={0.1} stroke="none" />
            <path
              d={linePath}
              fill="none"
              className="stroke-brand-500"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {hovered && hovered.y !== null && (
              <>
                <line
                  x1={hovered.x}
                  x2={hovered.x}
                  y1={PAD_TOP}
                  y2={CHART_H - PAD_BOTTOM}
                  className="stroke-brand-300"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={hovered.x} cy={hovered.y} r={4} className="fill-brand-500" stroke="#fff" strokeWidth={2} />
              </>
            )}
            <rect
              x={0}
              y={0}
              width={CHART_W}
              height={CHART_H}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            />
          </svg>

          <div className="mt-1 flex justify-between text-[11px] text-slate-400">
            <span>{formatDate(days[0].date)}</span>
            <span>{formatDate(days[days.length - 1].date)}</span>
          </div>

          {hovered && (
            <div className="pointer-events-none absolute -top-1 rounded-lg bg-slate-800 px-2 py-1 text-xs text-white shadow-soft" style={{ left: `min(${(hovered.x / CHART_W) * 100}%, 82%)` }}>
              <div className="font-semibold">{formatDate(hovered.date)}</div>
              <div>{hovered.avg !== null ? hovered.avg.toFixed(1) : t("analytics.calendarNoEntry")}</div>
            </div>
          )}
        </div>
      )}

      {hasAnyData && (
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          {showTable ? t("analytics.trendTableHide") : t("analytics.trendTableShow")}
        </button>
      )}

      {showTable && (
        <table className="mt-2 w-full text-left text-xs text-slate-600">
          <thead>
            <tr className="text-slate-400">
              <th className="py-1 font-medium">{t("analytics.trendTableDate")}</th>
              <th className="py-1 font-medium">{t("analytics.trendTableScore")}</th>
            </tr>
          </thead>
          <tbody>
            {days
              .filter((d) => d.avg !== null)
              .map((d) => (
                <tr key={d.date} className="border-t border-slate-100">
                  <td className="py-1">{formatDate(d.date)}</td>
                  <td className="py-1">{d.avg!.toFixed(1)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
