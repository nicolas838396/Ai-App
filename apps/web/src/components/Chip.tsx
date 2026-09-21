"use client";

export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-brand-400 bg-brand-500 text-white shadow-soft"
          : "border-slate-200 text-slate-600 hover:border-brand-200"
      }`}
    >
      {children}
    </button>
  );
}
