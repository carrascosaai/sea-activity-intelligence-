import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <span className="text-4xl">🧭</span>
      <p className="text-lg font-semibold">No hemos encontrado esta página.</p>
      <p className="text-sm text-muted max-w-xs">
        Puede que el enlace esté roto o la página ya no exista.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-accent text-[#04231d] font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
