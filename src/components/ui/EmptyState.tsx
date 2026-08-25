import Link from "next/link";

export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3 py-16">
      <span className="text-4xl">{icon}</span>
      <p className="text-lg font-semibold text-balance max-w-sm">{title}</p>
      {description && <p className="text-sm text-muted max-w-xs">{description}</p>}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-2 rounded-full bg-accent text-[#04231d] font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
