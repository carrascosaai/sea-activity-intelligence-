# TODO.md — Sea Activity Intelligence

Ver `VALIDATION.md` para el porqué de este alcance y `README.md` para arquitectura y
cómo correr el proyecto.

## Estado actual (después de la ampliación nacional)

El plan original era validar primero con 3 actividades y la Costa del Sol. Por petición
explícita del usuario se amplió a **20 actividades** y **cobertura nacional (~3.600
playas)** antes de tener datos de uso real. Ver README.md, sección "Nota sobre el
alcance". Lo de abajo refleja el estado real, no el plan original.

## Hecho

- [x] Documentación (README, VALIDATION, TODO)
- [x] Next.js + TypeScript + Tailwind + capa de proveedores (Open-Meteo real)
- [x] Motor de scoring generado por perfil base + escalado por nivel
      (`lib/scoring/profiles.ts` + `generateRules.ts`), 20 actividades × 3 niveles
- [x] Soporte de reglas de viento/oleaje en modo "rango" (deportes que necesitan un
      mínimo de viento: kitesurf, windsurf, wingfoil, vela) — no solo "menos es mejor"
- [x] Dataset nacional de ~3.630 playas generado desde OpenStreetMap
      (`scripts/generate-beaches.mjs`), con provincia/CCAA/municipio
- [x] Búsqueda de ubicaciones server-side (no se manda el dataset al navegador)
- [x] Landing: wizard actividad (agrupada por categoría) → ubicación (buscador) → nivel → cuándo
- [x] Resultado: score, banda, por qué, mejor ventana, comparación horaria
- [x] "¿Qué puedo hacer hoy?" con ranking de las 20 actividades
- [x] Recomendación cruzada entre actividades
- [x] Mapa nacional con clustering y carga por viewport (`/api/map-scores`)
- [x] Navbar/Footer consistentes, pulido visual (sombras, transiciones, animaciones sutiles)
- [x] Analítica básica, diseño responsive, aviso de seguridad
- [x] Asignación de provincia por código INE oficial (949 municipios de referencia en vez
      de 52 capitales) — verificado en fronteras reales (Sotogrande, Ayamonte, Ribadeo, La Manga)
- [x] Favicon e identidad visual propios (antes: logo por defecto de Next.js)
- [x] Metadatos por página (título de pestaña dinámico con actividad+playa, Open Graph)
- [x] Página 404 con el mismo estilo que el resto de la app
- [x] Estados vacíos/error consistentes (`EmptyState`) en vez de texto suelto
- [x] Límite de 7 días en "Elegir fecha" (antes se podía pedir una fecha sin datos de oleaje)
- [x] Revisión manual del motor de scoring en 6+ actividades con datos reales
      (vela, buceo, esquí acuático, baño...) — sin bugs encontrados
- [x] Claridad del agua para buceo/snorkel/apnea (NOAA ERDDAP, Kd490 real por satélite,
      sin API key) — ver README.md "Claridad del agua". Informativo, no resta puntos
- [x] Búsqueda de ubicaciones sin distinguir acentos ("malaga" ahora encuentra "Málaga")
- [x] Tipografía sin dependencia de red externa — se quitó Google Fonts (Inter) tras detectar
      que fallaba en este entorno y degradaba en silencio a una fuente genérica; ahora usa
      la pila de fuentes nativas del sistema (San Francisco / Segoe UI / Roboto), sin riesgo
      de fallo de red ni en dev ni en producción
- [x] Ilustración de cabecera propia (SVG, sin fotos de stock) en el primer paso del wizard
- [x] Footer con atribución de datos (Open-Meteo, OpenStreetMap, NOAA, Leaflet) en toda la app
- [x] Foco visible por teclado (accesibilidad) en botones, enlaces y campos, en toda la app
- [x] Skeleton de carga en el buscador de ubicaciones (antes solo bajaba la opacidad)
- [x] Anillo de score en SVG animado, iconos de condiciones propios, mapa oscurecido,
      popups del mapa con tema oscuro, barra de progreso del wizard (ver turno anterior)
- [x] Imagen de vista previa al compartir (og:image 1200×630, generada por código, sin
      fotos de stock) y icono de "añadir a pantalla de inicio" (apple-touch-icon + manifest)
- [x] `metadataBase` configurado con auto-detección del dominio real en Vercel
      (`VERCEL_URL`) — la imagen social nunca quedará apuntando a localhost al desplegar
- [x] Umbrales de viento/oleaje contrastados contra guías reales del sector (no solo
      estimación propia) para kitesurf, windsurf, wingfoil, vela, surf, buceo, snorkel
      y esquí acuático/wakeboard — fuentes citadas en `lib/scoring/profiles.ts`
- [x] Mecanismo de feedback real (👍/👎 "¿se ajustó?") en cada resultado, evento
      `recommendation_feedback` — probado de extremo a extremo, llega con activity/
      location/level/score/band/helpful. Es la pieza que falta para que la validación
      con usuarios reales (VALIDATION.md) empiece a generar datos en cuanto haya tráfico
- [x] **Desplegado en Vercel**: https://sea-activity-intelligence-deploy.vercel.app —
      público, con datos reales en vivo. El bloqueo de symlinks en Windows se esquivó
      diferenciando el bundle compilado de `/hoy` y `/mapa` (export inerte `__routeId`,
      ver comentario en esos archivos) para que Vercel no intente deduplicarlos
- [x] **Supabase conectado de verdad**: esquema aplicado, 3.630 playas cargadas, analítica
      y feedback verificados persistiendo en la base de datos real (tanto en local como en
      la web pública) — no solo en consola
- [x] Página `/privacidad` — qué se guarda, por qué, y cómo borrarlo, enlazada desde el footer
- [x] **Caché real de previsión** (`forecast_cache` en Supabase): cron diario de Vercel
      precalienta las 22 playas destacadas (límite del plan Hobby: solo cron diario, no
      cada 30 min — documentado en README) + escritura diferida (`after()`) en cualquier
      otra playa que se consulte en vivo, sin retrasar la respuesta. Verificado de extremo
      a extremo: `fetched_at` no cambia en una petición servida desde caché
- [x] **Rate limiting real** en `/api/locations/search` (60/min), `/api/map-scores` (20/min,
      más caro por playa) y `/api/analytics` (120/min), respaldado en Supabase — probado
      disparando 65 peticiones seguidas: las primeras 60 pasan, el resto devuelve 429
- [x] Previsión ampliada a 14 días (antes 7) — es el máximo que acepta la API sin dar error;
      un mes vista es literalmente imposible (Open-Meteo lo rechaza). Aviso de confianza
      decreciente a partir del día 7. Importante — verificado con cuidado dos veces (la
      primera vez mal: comprobé que la API no daba error, no que los valores no fueran
      `null`): la disponibilidad REAL varía por ubicación. Fuengirola tiene oleaje real
      hasta el día 14; Tarifa se queda con `null` a partir del día 9. El límite de 14 días
      es el máximo teórico del picker, no una garantía por playa — para eso está el aviso
      de "sin datos para esa fecha" ya existente, que cubre el caso correctamente
- [x] **El mapa ahora muestra y permite seleccionar las ~3.630 playas**, no solo las 22
      destacadas. Antes: el mapa solo cargaba `POPULAR_LOCATIONS` al inicio y limitaba
      cada zoom/pan a 80 vía `/api/map-scores` — la inmensa mayoría de playas nunca
      aparecía ni era clicable. Ahora: `public/beaches-lite.json` (generado por
      `scripts/generate-beaches.mjs`, servido como archivo estático por CDN, sin gastar
      ninguna función serverless) trae las 3.630 de golpe como puntos neutros
      seleccionables; solo se calcula la puntuación real (color) de las que están en
      pantalla, igual que antes. Verificado: clic en una playa nunca destacada
      ("Arenal d'en Casat", Mallorca) → recomendación real con datos en vivo

- [x] **Bandas de score de 5 niveles** (antes 3): ideal/buena/aceptable/mala/peligrosa,
      con su propio color (verde/teal/ámbar/naranja/rojo) — `lib/scoring/engine.ts`,
      `lib/bandLabels.ts`. Migración completa: mapa, resultado, ranking, comparación horaria
- [x] **"Cerca de mí"**: geolocalización del navegador + ranking de las mejores playas
      cercanas, diversificado por actividad Y por playa (reparto voraz, ver
      `app/api/nearby/route.ts`) — sin esto, playas a 1-3km comparten casi el mismo tiempo
      y salía la misma actividad o la misma playa repetida 8 veces, ya corregido y probado
- [x] **Páginas SEO** `/[actividad]/[ciudad]` (8 actividades × ~190 municipios con ≥2
      playas), dinámicas — no se pre-generan en el build (evita cientos de llamadas a
      APIs externas durante `next build` y contenido que quedaría obsoleto al momento).
      `sitemap.xml`/`robots.ts` con las 40 combinaciones más relevantes
- [x] **Caché real de previsión** (`forecast_cache` en Supabase) + cron diario de Vercel
      (`/api/cron/refresh-cache`, protegido con `CRON_SECRET`) que precalienta las playas
      destacadas. Verificado con tráfico real: 605 filas en caché, cron responde 401 sin
      secreto y 200 con él
- [x] **Límite de peticiones** en `/api/locations/search`, `/api/map-scores`, `/api/nearby`,
      `/api/analytics` — verificado en producción con 25 peticiones seguidas: bloquea con
      429 a partir del límite configurado, no antes

## P1 — Antes de anunciar "millones de clientes" de verdad

Ver README.md "Escalabilidad" para el detalle de qué falta y por qué.

- [ ] Caché más frecuente que una vez al día — necesitaría plan Vercel Pro (Hobby solo
      permite cron diario); mientras tanto la escritura diferida en cada petición real
      cubre bastante, pero no precalienta las playas destacadas más que 1 vez/día
- [ ] Monitorización/alertas de errores en producción (p. ej. Sentry) y de cuota de
      Open-Meteo (para saber si hace falta pasar a un plan de pago u otro proveedor)
- [ ] Revisar manualmente una muestra de playas por comunidad autónoma — la asignación
      de provincia (por municipio INE más cercano, con fallback a capital más cercana)
      no es point-in-polygon exacto; puede haber casos límite no detectados aún
- [ ] Conectar un dataset de turbidez de mayor resolución (Copernicus Marine, 100m) si
      se consigue una cuenta — el NOAA actual es 2km, más impreciso cerca de la costa
- [ ] Favoritos, alertas de "mejor ventana" (premium), histórico, `businesses`/`booking_links` reales

## Explícitamente fuera de alcance (no construir sin decisión explícita)

- Aplicación móvil nativa · Login obligatorio · Pagos · Marketplace de reservas completo
- Chat con IA · Redes sociales / comunidad · Perfiles de usuario complejos · Gamificación
- Deportes de piscina/competición y deportes de río (ver README, "Actividades cubiertas")

## Regla de oro

Antes de añadir cualquier funcionalidad nueva: ¿ayuda al usuario a decidir qué actividad
acuática hacer y cuándo? Si la respuesta es no, no se construye.
