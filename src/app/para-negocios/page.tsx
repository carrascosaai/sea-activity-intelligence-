import type { Metadata } from "next";
import { WidgetGenerator } from "@/components/WidgetGenerator";

export const metadata: Metadata = {
  title: "Para negocios",
  description: "Pon las condiciones del mar en directo de tu playa en tu propia web — gratis, sin cuenta.",
};

export default function ParaNegociosPage() {
  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-2">Widget gratis para tu escuela o tienda</h1>
      <p className="text-sm text-muted leading-relaxed mb-8 max-w-xl">
        ¿Tienes una escuela de surf, un alquiler de material o un chiringuito junto al mar? Pon las
        condiciones de tu playa — actualizadas cada hora, con los mismos datos reales que usa esta
        web — directamente en tu página. Gratis, sin cuenta, sin límite de uso. Un{" "}
        <code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded">{"<iframe>"}</code> que pegas una
        vez y ya está.
      </p>

      <WidgetGenerator />

      <div className="mt-10 pt-6 border-t border-border text-xs text-muted leading-relaxed max-w-xl">
        <p className="mb-2">
          El widget muestra la puntuación 0-100 de la actividad y nivel que elijas, con un enlace a la
          ficha completa en Sea Activity Intelligence. Se actualiza solo — no hace falta tocar nada
          después de pegarlo.
        </p>
        <p>
          Es el mismo motor y los mismos datos que el resto de la web (Open-Meteo, ver{" "}
          <a href="/privacidad" className="underline hover:text-foreground">
            privacidad
          </a>
          ) — nada inventado ni distinto para el widget.
        </p>
      </div>
    </div>
  );
}
