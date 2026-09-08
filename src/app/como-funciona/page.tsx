import type { Metadata } from "next";
import Link from "next/link";
import { Waves, MapPin, Database, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "De dónde salen los datos de esta web, cómo se calcula el score, y qué hemos comprobado contra la realidad.",
};

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/15 text-accent shrink-0">
          <Icon className="w-4 h-4" strokeWidth={2.25} />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-foreground/90 leading-relaxed flex flex-col gap-3">{children}</div>
    </section>
  );
}

function SourceRow({ label, source, note }: { label: string; source: string; note: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-accent text-right">{source}</span>
      </div>
      <p className="text-xs text-muted leading-relaxed">{note}</p>
    </div>
  );
}

export default function ComoFuncionaPage() {
  return (
    <div className="flex-1 max-w-2xl w-full mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold mb-2">Cómo funciona esta web</h1>
      <p className="text-sm text-muted leading-relaxed mb-10">
        Ninguno de los números que ves aquí sale de un modelo de IA generativa ni de una estimación a ojo. Esta
        página explica de dónde sale cada dato, cómo se convierte en una puntuación de 0 a 100, y qué hemos
        comprobado nosotros mismos contra fuentes oficiales reales — con los números concretos, no solo la promesa.
      </p>

      <Section icon={Database} title="De dónde sale cada dato">
        <p>
          Nada se inventa: si no hay un dato real para algo, la web lo dice explícitamente en vez de rellenarlo con
          una estimación disfrazada de medición.
        </p>
        <div className="rounded-xl bg-surface-2 border border-border p-4">
          <SourceRow
            label="Viento, oleaje, lluvia, temperatura"
            source="Open-Meteo"
            note="Modelo meteorológico gratuito, sin clave de API — agrega ECMWF, GFS y otros modelos operacionales públicos, los mismos que usan Windy o Windguru por debajo."
          />
          <SourceRow
            label="Mar de fondo (swell) vs mar de viento (chop)"
            source="Open-Meteo Marine"
            note="El oleaje se separa en sus dos componentes físicos reales, no solo un número combinado — clave para saber si hay una buena ola de surf organizada o solo chop desordenado."
          />
          <SourceRow
            label="Mareas"
            source="Constituyentes armónicos reales (TICON-4)"
            note="Cálculo astronómico calibrado con años de mediciones reales por estación — no una fórmula genérica Sol/Luna sin calibrar. Solo disponible cerca de 20 estaciones con licencia de uso comercial en toda España."
          />
          <SourceRow
            label="Claridad del agua"
            source="NOAA CoastWatch (satélite)"
            note="Turbidez del agua vista desde satélite, con 1-2 semanas de retraso — un proxy regional, no una medición del punto exacto de inmersión. Por eso no resta puntos del score."
          />
          <SourceRow
            label="Las ~3.500 playas"
            source="OpenStreetMap"
            note="Datos geográficos abiertos y editables por cualquiera — igual que Wikipedia, pero de mapas."
          />
          <SourceRow
            label="Especies de pesca por zona"
            source="GBIF"
            note="Ocurrencias reales de biodiversidad marina, citizen science — no una lista genérica de 'peces de España'."
          />
        </div>
      </Section>

      <Section icon={CheckCircle2} title="Lo hemos comprobado contra la realidad, no solo contra otro modelo">
        <p>
          Comparar un modelo contra otro modelo no demuestra nada — ambos pueden estar igual de equivocados. Así
          que en vez de eso, comparamos contra boyas y mareógrafos reales de Puertos del Estado.
        </p>
        <div className="rounded-xl bg-surface-2 border border-border p-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted text-left">
                <th className="pb-2 font-medium">Comprobación</th>
                <th className="pb-2 font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-t border-border/50">
                <td className="py-2 pr-3">Oleaje y temperatura del agua, costa abierta (Gran Canaria)</td>
                <td className="py-2 text-score-green font-medium">3% de diferencia con la boya real</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="py-2 pr-3">Viento, costa abierta (Gran Canaria)</td>
                <td className="py-2 text-score-green font-medium">3% de diferencia con la boya real</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="py-2 pr-3">Viento, bahía resguardada (Ría de Bilbao)</td>
                <td className="py-2 text-score-orange font-medium">
                  Hasta el doble de lo real — límite conocido, explicado abajo
                </td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="py-2 pr-3">Hora de las 4 mareas del día (estación a ~100 km de Bilbao)</td>
                <td className="py-2 text-score-green font-medium">Margen de 1 a 5 minutos con la predicción oficial</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          Metodología y cifras completas en el{" "}
          <a
            href="https://github.com/carrascosaai/sea-activity-intelligence-#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            README técnico del proyecto
          </a>
          .
        </p>
      </Section>

      <Section icon={AlertTriangle} title="Los límites reales, sin esconderlos">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>
            <strong>El viento en bahías, rías y puertos muy resguardados puede desviarse bastante del modelo</strong> —
            comprobado en Bilbao: la resolución de cualquier modelo regional (el nuestro, o el de cualquier otra app)
            no capta bien los efectos de viento muy locales de una costa compleja. En mar abierto el margen de error
            es de pocos puntos porcentuales.
          </li>
          <li>
            <strong>Las mareas solo están disponibles cerca de 20 estaciones</strong> — el resto de playas
            muestran &quot;no disponible&quot; en vez de un número inventado.
          </li>
          <li>
            <strong>La claridad del agua tiene 1-2 semanas de retraso</strong> y es una estimación regional por
            satélite, no la visibilidad real en el punto de inmersión — por eso no se resta del score.
          </li>
          <li>
            <strong>No hay dato de aforo/ocupación de playa</strong> — no existe ninguna fuente pública real para
            eso en España, así que no aparece (en vez de estimarlo a ojo).
          </li>
        </ul>
      </Section>

      <Section icon={Waves} title="Cómo se calcula el score de 0 a 100">
        <p>
          Cada uno de los 20 deportes tiene su propio perfil: qué combinación de viento, oleaje, periodo de ola,
          temperatura y lluvia le importa de verdad, y cuánto pesa cada factor. No es el mismo cálculo con etiquetas
          distintas — un kitesurfista necesita viento por encima de un mínimo (sin viento no hay nada que hacer);
          un surfista necesita oleaje organizado con un periodo de 10 a 14 segundos (mar de fondo de calidad, no
          chop de viento); alguien que quiere bañarse necesita justo lo contrario en el periodo — uno largo junto a
          oleaje real es más peligroso (más energía en la rotura, más riesgo de corrientes de retorno), no menos.
        </p>
        <p>
          Los umbrales de viento y oleaje de surf, kitesurf, windsurf, wingfoil, vela, buceo, snorkel y esquí
          acuático/wakeboard están contrastados contra guías publicadas de cada deporte, no estimados a ojo. El
          resto son estimaciones razonadas, con el mismo motor listo para recalibrarse con el feedback real que deja
          la gente en cada resultado (el botón de 👍 / 👎).
        </p>
      </Section>

      <Section icon={MapPin} title="Y lo que no se mide, se dice">
        <p>
          Si un dato no existe de forma abierta y fiable para España, no se inventa un número que parezca real. Las
          mareas, la marca de agua, el aforo — cuando falta algo, la web lo dice explícitamente en vez de rellenar el
          hueco. Es más lento de construir así, pero es la única forma honesta de que confíes en el resto de los
          números.
        </p>
      </Section>

      <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="rounded-full bg-accent text-[#04231d] font-semibold px-5 py-2.5 text-sm text-center hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
        <Link
          href="/privacidad"
          className="rounded-full border border-border px-5 py-2.5 text-sm text-center text-muted hover:text-foreground transition-colors"
        >
          Ver privacidad
        </Link>
      </div>
    </div>
  );
}
