import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacidadPage() {
  return (
    <div className="flex-1 max-w-xl w-full mx-auto px-5 py-8 text-sm leading-relaxed text-foreground/90">
      <h1 className="text-2xl font-bold mb-6">Privacidad</h1>

      <p className="mb-4">
        Sea Activity Intelligence está pensado para dar recomendaciones de actividades acuáticas sin
        necesidad de registrarte ni identificarte. Esta página explica, en lenguaje llano, qué datos
        se generan al usar la web y para qué se usan.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Qué se guarda en tu dispositivo</h2>
      <p className="mb-4">
        Al usar la web se genera un identificador aleatorio (no un nombre, email ni ningún dato que te
        identifique personalmente) que se guarda en el almacenamiento local de tu navegador
        (<code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded">localStorage</code>). Sirve
        únicamente para poder analizar cómo se usa la app de forma agregada — por ejemplo, saber
        cuántas veces se busca &quot;kitesurf en Tarifa&quot; en una semana, no quién lo busca.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Qué eventos se registran</h2>
      <p className="mb-2">Junto a ese identificador aleatorio, se registran acciones como:</p>
      <ul className="list-disc pl-5 mb-4 flex flex-col gap-1">
        <li>Qué actividad, ubicación y nivel se seleccionan en el buscador</li>
        <li>Qué recomendación se muestra (playa, actividad, puntuación)</li>
        <li>Si marcas 👍 o 👎 en &quot;¿esta recomendación se ajustó a lo que encontraste?&quot;</li>
      </ul>
      <p className="mb-4">
        No se registra tu ubicación real (GPS), ni tu IP se asocia de forma permanente a tu
        identificador, ni se comparte ni se vende a terceros con fines publicitarios. Se usa
        exclusivamente para entender qué funciona y ajustar el motor de recomendaciones del
        producto.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Proveedores de datos externos</h2>
      <p className="mb-4">
        Para calcular las recomendaciones, la web consulta en el momento servicios meteorológicos y
        oceanográficos de terceros (Open-Meteo, NOAA CoastWatch) enviándoles únicamente las
        coordenadas de la playa consultada — nunca datos sobre ti. El mapa usa teselas de
        OpenStreetMap.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Tus opciones</h2>
      <p className="mb-4">
        Puedes borrar el identificador local en cualquier momento desde los ajustes de privacidad de
        tu navegador (borrar datos de navegación / almacenamiento local de este sitio). Al hacerlo, la
        próxima visita generará uno nuevo.
      </p>

      <p className="text-muted mt-8">
        Este producto es un proyecto en fase inicial. Si tienes cualquier duda sobre estos datos,
        puedes dejar de usar la web en cualquier momento sin ninguna consecuencia — no requiere
        cuenta ni pago.
      </p>
    </div>
  );
}
