"use client";

export function Chip({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-5 py-4 text-left transition-all duration-150 cursor-pointer active:scale-[0.98] ${
        selected
          ? "border-accent bg-accent/10 ring-2 ring-accent/40"
          : "border-border bg-surface hover:border-accent/50 hover:bg-surface-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
      } ${className}`}
    >
      {children}
    </button>
  );
}
