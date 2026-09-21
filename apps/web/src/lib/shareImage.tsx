// Builds a self-contained, shareable PNG for an unlocked achievement
// (portrait, matching WhatsApp Status / Instagram Story dimensions) and
// shares or downloads it. The SVG markup here can't rely on Tailwind
// classes — it has to be rasterized standalone, detached from the page's
// stylesheet — so every color is resolved to a literal value up front.
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { METAL_STYLES, metalForTier } from "@/components/achievements/Medal";
import { buildBranchLeaves } from "@/components/achievements/LaurelWreath";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

function readThemeRgb(varName: string): string {
  if (typeof document === "undefined") return "rgb(51, 157, 124)";
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const [r, g, b] = raw.split(" ").map(Number);
  return `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function tspanLines(lines: string[], x: number, startDy: number, lineHeight: number): string {
  return lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? startDy : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
}

// Extracts an icon's rendered <path>/<circle> markup by mounting it into a
// detached DOM node — avoids pulling react-dom/server (meant for Node SSR,
// and a surprisingly large addition to the client bundle) into the browser
// bundle just for this one-off conversion. react-dom/client is already
// part of the app either way.
function iconInnerMarkup(Icon: LucideIcon, color: string): string {
  const container = document.createElement("div");
  const root = createRoot(container);
  flushSync(() => {
    root.render(<Icon color={color} strokeWidth={1.8} />);
  });
  const inner = container.querySelector("svg")?.innerHTML ?? "";
  root.unmount();
  return inner;
}

// Lucide icons always draw within a 24x24 internal coordinate space
// regardless of the `size` prop (that only sets the outer <svg> width/
// height) — since we paste just the inner paths into our own <g>, we have
// to apply that scale ourselves to get a `targetSize`px icon.
function scaledIconMarkup(icon: LucideIcon, color: string, targetSize: number): string {
  const scale = targetSize / 24;
  return `<g transform="scale(${scale})">${iconInnerMarkup(icon, color)}</g>`;
}

export interface ShareCardParams {
  icon: LucideIcon;
  tierIndex: number;
  tierCount: number;
  title: string;
  description: string;
  statLine: string | null;
  quote: string;
}

export function buildShareCardSvgMarkup(params: ShareCardParams): string {
  const { icon, tierIndex, tierCount, title, description, statLine, quote } = params;
  const metal = metalForTier(tierIndex, tierCount);
  const metalStyle = METAL_STYLES[metal];
  const brand500 = readThemeRgb("--brand-500");
  const brand700 = readThemeRgb("--brand-700");
  const calm600 = readThemeRgb("--calm-600");
  const calm900 = readThemeRgb("--calm-900");

  const cx = CARD_WIDTH / 2;
  const wreathCy = 760;
  const wreathSize = 560;
  const medalRadius = 150;
  const iconSize = 130;

  const leftLeaves = buildBranchLeaves("left", cx, wreathCy, wreathSize * 0.44, 8);
  const rightLeaves = buildBranchLeaves("right", cx, wreathCy, wreathSize * 0.44, 8);
  const leafMarkup = [...leftLeaves, ...rightLeaves]
    .map(
      (leaf) =>
        `<ellipse cx="${leaf.x}" cy="${leaf.y}" rx="${wreathSize * 0.05}" ry="${wreathSize * 0.022}" fill="#e8c962" transform="rotate(${leaf.rotate} ${leaf.x} ${leaf.y})" />`,
    )
    .join("");

  const titleLines = wrapText(title, 20);
  const descLines = wrapText(description, 34);

  const confetti = Array.from({ length: 26 }, (_, i) => {
    const x = (i * 97) % CARD_WIDTH;
    const y = 120 + ((i * 233) % 1500);
    const colors = ["#f97316", "#facc15", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"];
    const color = colors[i % colors.length];
    const rotate = (i * 47) % 360;
    return `<rect x="${x}" y="${y}" width="14" height="6" rx="2" fill="${color}" opacity="0.55" transform="rotate(${rotate} ${x} ${y})" />`;
  }).join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand700}" />
      <stop offset="55%" stop-color="${calm600}" />
      <stop offset="100%" stop-color="${calm900}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${brand500}" stop-opacity="0.55" />
      <stop offset="100%" stop-color="${brand500}" stop-opacity="0" />
    </radialGradient>
    <style>
      text { font-family: 'Nunito', 'Segoe UI', system-ui, sans-serif; }
    </style>
  </defs>

  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)" />
  ${confetti}

  <g>
    <circle cx="${cx}" cy="70" r="34" fill="${brand500}" />
    <text x="${cx}" y="80" text-anchor="middle" font-size="34" fill="white">✦</text>
  </g>
  <text x="${cx}" y="145" text-anchor="middle" font-size="44" font-weight="800" fill="white">Mira</text>

  <circle cx="${cx}" cy="${wreathCy}" r="${wreathSize * 0.5}" fill="url(#glow)" />
  ${leafMarkup}
  <circle cx="${cx - wreathSize * 0.44 * 0.97}" cy="${wreathCy + wreathSize * 0.44 * 0.32}" r="10" fill="#e8c962" />
  <circle cx="${cx + wreathSize * 0.44 * 0.97}" cy="${wreathCy + wreathSize * 0.44 * 0.32}" r="10" fill="#e8c962" />

  <circle cx="${cx}" cy="${wreathCy}" r="${medalRadius}" fill="${metalStyle.ring}" />
  <circle cx="${cx}" cy="${wreathCy}" r="${medalRadius * 0.78}" fill="${metalStyle.disc}" />
  <circle cx="${cx}" cy="${wreathCy}" r="${medalRadius * 0.95}" fill="none" stroke="${metalStyle.dark}" stroke-width="5" opacity="0.5" />
  <g transform="translate(${cx - iconSize / 2}, ${wreathCy - iconSize / 2})">
    ${scaledIconMarkup(icon, metalStyle.dark, iconSize)}
  </g>

  <text x="${cx}" y="1160" text-anchor="middle" font-size="56" font-weight="800" fill="white">
    ${tspanLines(titleLines, cx, 0, 66)}
  </text>
  <text x="${cx}" y="${1160 + titleLines.length * 66 + 50}" text-anchor="middle" font-size="32" fill="white" opacity="0.85">
    ${tspanLines(descLines, cx, 0, 42)}
  </text>

  ${
    statLine
      ? (() => {
          const statLines = wrapText(statLine, 26);
          const pillHeight = 70 + statLines.length * 46;
          const pillY = 1500 - (pillHeight - 90) / 2;
          const textY = pillY + pillHeight / 2 - ((statLines.length - 1) * 46) / 2 + 12;
          return `<g>
            <rect x="${cx - 460}" y="${pillY}" width="920" height="${pillHeight}" rx="${pillHeight / 2}" fill="white" opacity="0.15" />
            <text x="${cx}" y="${textY}" text-anchor="middle" font-size="34" font-weight="700" fill="white">
              ${tspanLines(statLines, cx, 0, 46)}
            </text>
          </g>`;
        })()
      : ""
  }

  <text x="${cx}" y="1720" text-anchor="middle" font-size="28" font-style="italic" fill="white" opacity="0.75">${escapeXml(quote)}</text>

  <text x="${cx}" y="1840" text-anchor="middle" font-size="26" fill="white" opacity="0.6">Mira · Deine mentale Gesundheit, jeden Tag ein bisschen besser</text>
</svg>`.trim();
}

export async function svgMarkupToPngBlob(svgMarkup: string, width: number, height: number): Promise<Blob> {
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.width = width;
    img.height = height;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("SVG konnte nicht geladen werden."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas wird nicht unterstützt.");
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Bild konnte nicht erzeugt werden."))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type ShareResult = "shared" | "downloaded" | "failed";

export async function shareOrDownloadImage(blob: Blob, filename: string, shareText: string): Promise<ShareResult> {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
  };

  try {
    if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: "Mira", text: shareText });
      return "shared";
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return "failed"; // user cancelled the share sheet
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return "downloaded";
  } catch {
    return "failed";
  }
}

export const SHARE_CARD_SIZE = { width: CARD_WIDTH, height: CARD_HEIGHT };
