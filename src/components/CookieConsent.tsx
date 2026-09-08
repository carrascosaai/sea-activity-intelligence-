"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "sai-analytics-consent";
type Consent = "granted" | "denied";

/**
 * Google Analytics solo debería cargar sus cookies si el visitante lo acepta
 * — por eso el <Script> vive aquí, dentro del mismo componente que pregunta,
 * y no en layout.tsx directamente. Sin consentimiento explícito ("granted"),
 * el script de Google nunca llega a insertarse en la página.
 *
 * La decisión se guarda en localStorage del propio navegador (no en ninguna
 * cookie ni servidor nuestro) para no volver a preguntar en cada visita.
 */
export function CookieConsent({ gaMeasurementId }: { gaMeasurementId?: string }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (stored === "granted" || stored === "denied") setConsent(stored);
    } catch {
      // Si el navegador bloquea localStorage (modo privado estricto, etc.),
      // simplemente no se persiste la elección — no rompe nada.
    }
    setChecked(true);
  }, []);

  function choose(value: Consent) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    setConsent(value);
  }

  const shouldLoadAnalytics = Boolean(gaMeasurementId) && consent === "granted";

  return (
    <>
      {shouldLoadAnalytics && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </>
      )}

      {checked && gaMeasurementId && consent === null && (
        <div
          role="dialog"
          aria-label="Aviso de cookies"
          className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-5 animate-fade-up"
        >
          <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface shadow-xl shadow-black/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent/15 text-accent shrink-0">
                <Cookie className="w-[18px] h-[18px]" strokeWidth={2} />
              </span>
              <p className="text-sm text-foreground/90 leading-relaxed">
                Usamos Google Analytics para saber cuánta gente visita la web y qué páginas se usan
                más. No te identifica personalmente.{" "}
                <Link href="/privacidad" className="underline hover:text-accent transition-colors">
                  Más información
                </Link>
                .
              </p>
            </div>
            <div className="flex gap-2 shrink-0 sm:pl-1">
              <button
                type="button"
                onClick={() => choose("denied")}
                className="flex-1 sm:flex-none rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="flex-1 sm:flex-none rounded-full bg-accent text-[#04231d] font-semibold px-4 py-2 text-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
