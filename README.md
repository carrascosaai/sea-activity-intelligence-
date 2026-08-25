# Sea Activity Intelligence

🔴 **En vivo:** https://sea-activity-intelligence-deploy.vercel.app

Capa de decisión sobre datos meteorológicos y marítimos: responde a "¿qué actividad
acuática puedo hacer ahora, dónde y en qué condiciones?" con una recomendación clara
(5 niveles 🟢🟢🟡🟠🔴 + score 0-100 + por qué), no con un dashboard de datos crudos.
Incluye geolocalización ("cerca de mí"), páginas por actividad+ciudad
(`/surf/malaga`) y caché real de previsión con cron diario.

Cobertura: **toda la costa de España** (~3.600 playas) y **20 deportes/actividades
acuáticas**. Ver [`VALIDATION.md`](./VALIDATION.md) para el problema, hipótesis,
competencia y criterios de éxito/abandono, y [`TODO.md`](./TODO.md) para el estado
detallado del alcance.

> Nota sobre el alcance: el plan original (`AGENTS.md`/brief inicial) proponía validar
> primero con 3 actividades y la Costa del Sol antes de escalar. La ampliación a
> cobertura nacional y 20 actividades se hizo por petición explícita del usuario,
> saltándose ese orden — ver la sección "Decisiones de arquitectura" más abajo para lo
> que eso implica en la práctica.

## Qué hace

- Preguntas: actividad → ubicación (playa, buscador nacional) → nivel → cuándo → **resultado**.
- Resultado: score 0-100 específico por actividad+nivel, banda 🟢/🟡/🔴, condiciones,
  explicación en lenguaje llano, mejor ventana horaria del día.
- Comparación horaria: cómo evoluciona el score a lo largo del día.
- Modo **"¿Qué puedo hacer hoy?"**: ranking de las 20 actividades para una ubicación+nivel.
- Recomendación cruzada: si otra actividad tiene condiciones claramente mejores ahora,
  lo dice explícitamente.
- Mapa de España con semáforo de condiciones, carga bajo demanda por viewport y
  agrupación (clustering) de marcadores.
- Aviso de seguridad no-absoluto en cada resultado (nunca "es seguro").

## Actividades cubiertas (20)

Tabla/deslizamiento: Surf, Paddle Surf, Bodyboard, Kitesurf, Windsurf, Wingfoil.
Remo y vela: Kayak, Remo, Vela/Navegación. Submarinismo: Buceo, Snorkel, Apnea. Motor:
Esquí acuático, Wakeboard, Moto de agua, Flyboard. Otros: Pesca, Coasteering, Baño en
la playa (no es deporte, pero es la pregunta más común), Natación en aguas abiertas.

Deliberadamente FUERA: deportes de piscina/competición (natación en piscina, waterpolo,
saltos) y deportes de río (rafting, barranquismo de agua dulce) — el modelo de datos es
100% costero (`MarineProvider` = oleaje de mar), así que cualquier actividad sin
relación real con el mar/viento en costa queda fuera por diseño. Ver
`src/lib/activities.ts`.

## Arquitectura

```
src/
  lib/
    types.ts, activities.ts, time.ts, forecast.ts, bandLabels.ts
    locations.ts            Acceso a src/data/beaches.json (SOLO server-side)

    providers/               ── Capa de abstracción de datos ──
      types.ts, openMeteoWeather.ts, openMeteoMarine.ts, tide.ts (NullTideProvider)
      noaaVisibility.ts         Claridad del agua (NOAA ERDDAP, ver sección propia abajo)

    scoring/                ── Motor de decisión ──
      ruleTypes.ts             Tipos de reglas (viento/oleaje: lineal o por rango)
      profiles.ts               Perfil base (nivel principiante) de cada actividad
      generateRules.ts           Deriva intermedio/avanzado escalando el perfil base
      config.ts                   Tabla completa generada (20 actividades × 3 niveles)
      engine.ts                    scoreCondition(): snapshot → { score, band, reasons }
      dayScores.ts                  Scores por hora + "mejor ventana"

  components/            UI (ScoreBadge, HourlyComparison, LocationSearch, MapClient...)
  app/
    page.tsx               Landing + wizard
    resultado/page.tsx      Resultado
    hoy/page.tsx             "¿Qué puedo hacer hoy?"
    mapa/page.tsx             Mapa: TODAS las playas seleccionables (clustering), color
                              real solo para las que están en pantalla (carga por viewport)
    api/
      analytics/route.ts      Eventos de analítica
      locations/search/       Búsqueda de playas (server-side)
      map-scores/              Scores para el mapa, acotados al viewport visible

data/
  beaches.json            ~3.600 playas de España (generado, ver scripts/)

scripts/
  provinces.mjs             Tabla de provincias/CCAA + heurística de "capital más cercana"
  generate-beaches.mjs        Genera src/data/beaches.json desde OpenStreetMap (Overpass)
  seed-supabase.mjs            Carga beaches.json en Supabase (opcional, P1)

db/
  schema.sql              Esquema Supabase/Postgres
```

**Capa de proveedores:** ninguna pantalla ni el motor de scoring llaman directamente a
Open-Meteo. Todo pasa por `WeatherProvider` / `MarineProvider` / `TideProvider`. Cambiar
de proveedor es sustituir un archivo en `lib/providers/`, no reescribir la app.

**Motor de scoring generado, no copiado 20 veces:** `lib/scoring/profiles.ts` define un
perfil base por actividad (referencia: nivel principiante) — viento, oleaje, periodo,
comodidad. `generateRules.ts` deriva automáticamente intermedio/avanzado escalando esos
números. Así se evita mantener 20 actividades × 3 niveles × 5 factores a mano. El viento
y el oleaje pueden modelarse como **lineal** ("cuanto menos, mejor" — kayak, buceo...) o
como **rango** ("necesita un mínimo, y también penaliza el exceso" — kitesurf, windsurf,
vela: sin viento suficiente, literalmente no se puede practicar). Verificado con datos
reales en Tarifa (Playa de Valdevaqueros): el kitesurf puntúa mal de madrugada (viento
flojo) y bien por la tarde (viento térmico), reflejando el patrón real de la zona.

**Umbrales contrastados, no solo "a ojo":** kitesurf, windsurf, wingfoil, vela, surf,
buceo, snorkel y esquí acuático/wakeboard tienen sus rangos de viento/oleaje contrastados
contra guías publicadas del propio deporte (federaciones, escuelas, comunidad), no solo
estimados — cada perfil en `profiles.ts` cita su fuente y fecha de consulta. El resto
(pesca, coasteering, baño, remo, moto de agua, flyboard...) sigue siendo una estimación
razonada por extrapolación, sin una guía tan directa que contrastar. En todos los casos
siguen siendo un punto de partida: la pieza que falta para una validación de verdad es
uso real, y para eso existe el widget de feedback (👍/👎) en cada resultado — evento
`recommendation_feedback` en `lib/analytics.ts`, probado de extremo a extremo.

## Cobertura nacional de playas

`src/data/beaches.json` se genera con `node scripts/generate-beaches.mjs` a partir de
datos reales de OpenStreetMap (Overpass API, `natural=beach` en España): ~3.630 playas
con nombre, municipio más cercano, provincia, comunidad autónoma y coordenadas. **No se
genera en cada build automáticamente** (depende de una API externa que puede tardar o
fallar) — es un paso manual cuando se quiera refrescar el dataset. El archivo generado sí
se versiona en el repo.

La provincia/CCAA de cada playa se asigna por el **municipio conocido más cercano**
(~950 municipios con código INE oficial extraído de `ref:ine` en OpenStreetMap — dato
administrativo real, no adivinado) en vez de la distancia a una única capital de
provincia. Fallback: si no hay ningún municipio con código INE a menos de 60 km (islas
remotas, zonas poco pobladas), se usa una heurística de "capital más cercana en línea
recta" (`scripts/provinces.mjs`) con una excepción explícita para Ceuta/Melilla — sin
ella, playas de la costa gaditana como Tarifa se asignaban erróneamente al otro lado del
Estrecho por pura cercanía en línea recta (bug real detectado y corregido durante el
desarrollo). Verificado manualmente en varias fronteras provinciales reales (Sotogrande,
Ayamonte, Ribadeo, La Manga) sin anomalías.

**El dataset de playas NUNCA se importa desde un componente cliente** (`"use client"`):
la búsqueda de ubicaciones pasa por `/api/locations/search` y los scores del mapa por
`/api/map-scores`, ambos server-side. Así el bundle del navegador no crece con las
~3.600 playas — ver "Escalabilidad" más abajo.

## Claridad del agua (buceo, snorkel, apnea)

No existe una API pública real de "visibilidad de buceo" en España. Investigado y
descartado antes de construir nada:

- **Copernicus Marine Service** sí tiene productos reales de turbidez/color del océano
  a 100m de resolución para la costa española, pero requieren cuenta registrada y se
  sirven como ficheros netCDF pensados para clientes Python — no encajan en un backend
  Next.js/TypeScript sin una pieza adicional de infraestructura.
- **Webcams de playas** existen (Hispacams, PlayaWebcams, ~200 cámaras), pero no hay un
  directorio con API pública, y "analizar" video de terceros sin permiso para inferir
  visibilidad submarina no es algo que se pueda montar de forma fiable ni honesta en
  esta fase — una cámara de superficie tampoco ve lo mismo que un buceador bajo el agua.

Lo que sí se usa, y es real: **NOAA CoastWatch (ERDDAP)**, servicio público del gobierno
de EE.UU., gratuito y sin API key, con el coeficiente de atenuación de luz Kd490 por
satélite (`Kd490 Gap-filled DINEOF, Global 2km, Daily`) — ver
[`src/lib/providers/noaaVisibility.ts`](src/lib/providers/noaaVisibility.ts). Se convierte
a un rango orientativo de metros con la fórmula clásica *profundidad Secchi ≈ 1.7 / Kd490*.

Limitaciones reales, visibles en la propia tarjeta de la app, no escondidas:
- **Con varios días de retraso** (normalmente 1-2 semanas: revisita del satélite +
  procesado), nunca es "ahora mismo".
- **Menos fiable en aguas muy someras de fondo arenoso claro** (el fondo puede sesgar la
  estimación) — verificado en Platja d'es Trenc (Baleares, agua famosa por su
  transparencia), que sale como "Moderada" probablemente por este efecto, no porque el
  agua esté realmente turbia.
- Por eso **no resta puntos del score 0-100**: se muestra como información adicional
  aparte, con un enlace para buscar una webcam de la zona y comprobarlo a simple vista.

Nota de depuración real: la primera versión devolvía "no disponible" en todas las playas
porque NOAA bloquea (403) peticiones sin cabecera `User-Agent`, y `fetch` de Node no
manda una por defecto — quedó corregido y es la causa por la que el proveedor fija
explícitamente ese header.

## Escalabilidad — qué está preparado y qué falta

Esto es lo más importante que hay que entender antes de anunciar "millones de clientes":

**Preparado en código y verificado en producción:**
- El dataset de playas nunca llega al navegador (búsqueda y scores del mapa son API
  routes server-side).
- El mapa nunca calcula el score de las ~3.600 playas a la vez: solo calcula las que
  caen dentro del viewport visible (`locationsInBounds`, tope de 80), y agrupa
  marcadores con clustering (`react-leaflet-cluster`) para que el DOM no se sature.
- Las respuestas de Open-Meteo se cachean 30 min por ubicación+fecha vía el fetch cache
  de Next.js — muchos usuarios pidiendo la misma playa reutilizan la misma respuesta.
- **Caché propia en Supabase** (`forecast_cache`, ver `lib/cache/forecastCache.ts`):
  un cron diario de Vercel (`vercel.json`, `/api/cron/refresh-cache`, protegido con
  `CRON_SECRET`) precalienta las 22 playas destacadas; cualquier otra playa que se
  consulte en vivo se guarda en caché con escritura diferida (`after()` de Next.js) sin
  retrasar la respuesta al usuario. Verificado: una petición servida desde caché no
  cambia `fetched_at`, una a una playa nueva sí la crea.
- **Rate limiting real**, respaldado en Supabase (`lib/rateLimit.ts`): 60 peticiones/min
  en `/api/locations/search`, 20/min en `/api/map-scores` (más cara, hasta 80 llamadas
  externas por petición), 120/min en `/api/analytics`. Probado disparando 65 peticiones
  seguidas: las primeras 60 pasan, el resto devuelve 429.

**Límite real de la plataforma (no es cuestión de código):** el plan Hobby de Vercel
solo permite cron **diario** — `*/30 * * * *` falla al desplegar. La caché de las playas
destacadas se precalienta una vez al día, no cada 30 min; la protección real contra
picos de tráfico viene de la escritura diferida en cada petición, no del cron. Para
refresco más frecuente hace falta plan Pro.

**NO está hecho todavía:**
- Monitorización/alertas de errores en producción (p. ej. Sentry).
- Los datos de Open-Meteo son gratuitos con un uso razonable esperado; a volumen muy
  alto puede hacer falta pasar a un plan de pago o a un proveedor distinto — la capa de
  abstracción (`WeatherProvider`/`MarineProvider`) existe precisamente para que ese
  cambio no obligue a tocar el resto de la app.

## Despliegue

Desplegado con `vercel deploy --temporary --yes` desde una copia del proyecto en una
carpeta con nombre válido para Vercel (minúsculas, sin espacios) — la carpeta original
del proyecto en Windows sí puede tener espacios/mayúsculas sin problema, solo hace falta
para el propio comando de deploy.

**Nota para Windows:** el primer intento de despliegue falló con
`EPERM: operation not permitted, symlink` — Vercel deduplica funciones serverless
idénticas con un symlink al empaquetar, y Windows no deja crear symlinks sin Modo de
Desarrollador activado o una terminal como Administrador. Se evitó sin tocar ningún
ajuste del sistema: `app/hoy/page.tsx` y `app/mapa/page.tsx` llevan un export inerte
(`__routeId`) que hace que sus bundles compilados ya no sean idénticos, así Vercel no
intenta deduplicarlos. Si en el futuro aparece el mismo error en otra ruta, el mismo
truco sirve.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Leaflet + react-leaflet +
react-leaflet-cluster (mapa, capa gratuita de OpenStreetMap) · Supabase/Postgres
(opcional en MVP) · Vercel (deploy recomendado).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000. No hace falta ninguna variable de entorno para que funcione
el flujo completo — los datos meteorológicos y marítimos son reales desde el primer
arranque, y las ~3.600 playas ya están generadas en `src/data/beaches.json`.

### Regenerar el dataset de playas (opcional)

```bash
node scripts/generate-beaches.mjs
```

Tarda varios minutos y depende de la disponibilidad de la API pública de Overpass (puede
necesitar reintentos — el script ya reintenta solo). Usa `--use-cache` para reprocesar
sin volver a descargar si `scripts/tmp/*.json` ya existe.

### Supabase

**Ya conectado en producción** — la analítica y el feedback (👍/👎 en cada resultado) se
guardan de verdad, verificado con clics reales tanto en local como en la web pública.
Sin las variables de entorno, la app degrada sola a `console.log` (nunca rompe nada).
Para conectar tu propio proyecto desde cero:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta [`db/schema.sql`](./db/schema.sql) en el SQL editor del proyecto.
3. Copia `.env.example` a `.env.local` y rellena `SUPABASE_URL` y
   `SUPABASE_SERVICE_ROLE_KEY` (la `service_role`, no la `anon` — da acceso total, nunca
   se sube al repo, `.env.local` está en `.gitignore`).
4. `node scripts/seed-supabase.mjs` para cargar las ~3.600 playas.
5. En Vercel: `vercel env add SUPABASE_URL production` y lo mismo para
   `SUPABASE_SERVICE_ROLE_KEY`, luego redeploy.

## Analítica

Eventos: `location_selected`, `activity_selected`, `skill_selected`, `forecast_viewed`,
`recommendation_viewed`, `location_clicked`, `business_clicked`, `booking_clicked`,
`favorite_created`. Cliente: `src/lib/analytics.ts` (best-effort, nunca bloquea la UI).
Servidor: `src/app/api/analytics/route.ts`.

## Modelo de negocio (diseño, no implementado en MVP)

El esquema (`db/schema.sql`) incluye `businesses` y `booking_links` para leads de
afiliación hacia escuelas/alquileres locales. El MVP no muestra enlaces de reserva ni
cobra nada — ver `VALIDATION.md`.

## Seguridad y responsabilidad

El producto nunca afirma que una actividad "es segura". Toda pantalla de resultado
incluye un aviso explícito (`src/components/SafetyNotice.tsx`).
