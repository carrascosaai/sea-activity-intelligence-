import type { ActivityId } from "../types";
import type { ActivityProfile } from "./ruleTypes";

/**
 * Perfil base por actividad, en la referencia de nivel PRINCIPIANTE. Los
 * niveles intermedio/avanzado se derivan automáticamente escalando estos
 * números (ver generateRules.ts) — así evitamos mantener a mano 20
 * actividades × 3 niveles × 5 factores por separado.
 *
 * Umbrales de viento/oleaje: donde existe una guía publicada del propio
 * deporte (federaciones, escuelas, comunidad — ver comentario junto a cada
 * actividad con fuente y fecha de consulta), los números están contrastados
 * contra ella, no inventados. Donde no existe una referencia así de directa
 * (pesca, coasteering, baño, remo, moto de agua, flyboard...) siguen siendo
 * estimaciones razonadas por extrapolación de las actividades cercanas que
 * sí están contrastadas. En ambos casos son un punto de partida, pensado
 * para poder recalibrarse con datos de uso real (ver `recommendation_feedback`
 * en lib/analytics.ts) sin tocar el motor — ver VALIDATION.md.
 *
 * Nota de honestidad de datos: NO existe proveedor de visibilidad
 * subacuática real (Open-Meteo solo da visibilidad atmosférica), así que
 * buceo/snorkel/apnea NO usan ese campo en su score — mejor no puntuar un
 * factor que no podemos medir de verdad que inventarlo. (Sí hay una
 * estimación de claridad de agua por satélite, informativa y separada del
 * score — ver providers/noaaVisibility.ts.)
 *
 * RECALIBRACIÓN sep. 2026 — revisión pedida tras detectar que el peso
 * relativo de cada factor no reflejaba lo que de verdad importa para cada
 * deporte (p. ej. en surf el oleaje/periodo pesaban parecido al viento,
 * cuando en la práctica son el factor dominante). Cambios de fondo:
 *
 * 1. El PESO de cada factor (maxPenalty) ahora refleja qué tan decisivo es
 *    de verdad en cada deporte, agrupando las 20 actividades en categorías
 *    con la misma lógica física:
 *      - Deslizamiento sobre la ola (surf, bodyboard): oleaje + periodo
 *        mandan, el viento es secundario (textura, no un "sí/no").
 *      - Impulsados por viento (kitesurf, windsurf, wingfoil, vela): el
 *        viento es el factor que decide si se puede practicar o no.
 *      - Agua plana / a motor (kayak, paddle-surf, esquí acuático,
 *        wakeboard, moto de agua, flyboard, remo): la calma manda —
 *        oleaje Y periodo (el "chop" corto es justo lo que estropea el
 *        agua plana), viento secundario.
 *      - Submarinismo (buceo, snorkel, apnea): oleaje en superficie manda
 *        (visibilidad, olas al entrar/salir), viento lo genera.
 *      - Expuestos a la rotura en orilla/rocas (baño, natación en aguas
 *        abiertas, coasteering, pesca desde espigón/roca): oleaje manda,
 *        y el periodo pasa a sumar riesgo en vez de restarlo (ver punto 2).
 *
 * 2. El PERIODO ahora tiene 3 modelos distintos según el deporte en vez de
 *    uno solo "más alto = mejor" (ver ruleTypes.ts, tipo PeriodRule):
 *      - "range" (surf, bodyboard): un periodo de 10-14 s es oleaje de
 *        fondo bien organizado y de calidad; por debajo de ~10 s es oleaje
 *        de viento, más débil y desordenado (Surfline "Groundswell vs.
 *        Windswell"; SurfSpotGuide "Swell Period Chart"; SurferToday /
 *        BodyboardGuide para bodyboard — sep. 2026).
 *      - "shorter-is-worse" (agua plana / a motor / submarinismo): un
 *        periodo corto = oleaje de viento, empinado, más incómodo e
 *        inestable a la misma altura que uno de periodo largo (NJ Scuba
 *        "Wind, Waves & Weather"; comparación real citada en foros de pesca
 *        en barco: "5 pies a 5 s es muy duro, 5 pies a 10 s es un día
 *        precioso" — sep. 2026).
 *      - "longer-is-worse" (baño, natación, coasteering, pesca desde
 *        orilla/roca/espigón): AL REVÉS que los anteriores — un periodo
 *        largo transporta más energía a la rotura y genera corrientes de
 *        retorno y golpes de mar más fuertes con la misma altura de ola
 *        (NOAA: "la fuerza de las corrientes de retorno aumenta con la
 *        altura Y el periodo del oleaje"; PierSeeker sobre "sneaker waves"
 *        en pesca desde espigón — sep. 2026). Este es el mismo principio
 *        que ya usaba el indicador de riesgo de corrientes de retorno
 *        (lib/ripCurrentRisk.ts) — antes el score de baño/natación
 *        penalizaba el periodo CORTO, justo al revés de lo que dice la
 *        oceanografía real para este caso.
 */
export const ACTIVITY_PROFILES: Record<ActivityId, ActivityProfile> = {
  // Oleaje contrastado con guías de surf reales: principiante 1-3 pies
  // (0,3-0,9 m), intermedio 3-4 pies (0,9-1,2 m), avanzado overhead 6 pies+
  // (surfspotguide.com, 10oversurf.com, thesurfingsite.com — ago. 2026).
  // Periodo: 10-14 s es la franja de mar de fondo de mejor calidad; por
  // debajo de 10 s es oleaje de viento débil y desordenado. Por encima de
  // 14 s sigue siendo muy buen oleaje (más potente, no "peor"), así que casi
  // no penaliza hacia arriba — el límite duro está muy lejos (22 s) y solo
  // entra en juego con swells extremos (Surfline, SurfSpotGuide — sep. 2026).
  // El viento baja de peso frente al oleaje/periodo: en surf decide sobre
  // todo la calidad de la ola, el viento solo la "peina" o la "revuelve".
  surf: {
    wind: { kind: "linear", goodKmh: 12, badKmh: 32, maxPenalty: 22, noGoKmh: 50 },
    wave: { kind: "range", idealMinM: 0.3, idealMaxM: 0.9, hardMinM: 0.15, hardMaxM: 1.3, maxPenalty: 45, noGoM: 2.5 },
    period: { kind: "range", idealMinS: 10, idealMaxS: 14, hardMinS: 6, hardMaxS: 22, maxPenalty: 33 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 10,
    // Puntúa sobre el swell (mar de fondo), no sobre el mar combinado — lo
    // que hace una ola buena o mala es el swell, no el chop local mezclado
    // (verificado sep. 2026: Open-Meteo separa ambos componentes, ver
    // providers/openMeteoMarine.ts).
    useSwellData: true,
  },
  // Igual lógica que surf pero algo menos exigente: se puede hacer bodyboard
  // con oleaje algo más pequeño/messy que en tabla de pie. Periodo medio
  // (9-12 s) ya es bueno, 12-16 s excelente (SurferToday "The ideal ocean
  // conditions for learning to bodyboard", BodyboardGuide.com — sep. 2026).
  bodyboard: {
    wind: { kind: "linear", goodKmh: 12, badKmh: 30, maxPenalty: 20, noGoKmh: 50 },
    wave: { kind: "range", idealMinM: 0.3, idealMaxM: 1.0, hardMinM: 0.15, hardMaxM: 1.6, maxPenalty: 35, noGoM: 2.8 },
    period: { kind: "range", idealMinS: 9, idealMaxS: 14, hardMinS: 5, hardMaxS: 20, maxPenalty: 25 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 10,
    useSwellData: true,
  },
  // Paddle surf de recreo/travesía (agua tranquila, no olas) — no es la
  // variante de surf en ola. Guías de SUP para principiantes: viento ideal
  // ≤5 nudos (~9 km/h), evitar salir con ≥10 mph (~16 km/h); un principiante
  // nunca debería salir con ≥10 nudos (Glidesup "How Windy Is Too Windy to
  // SUP", Aqua Bound — sep. 2026). El periodo corto (chop) ahora pesa más:
  // es justo lo que hace inestable una tabla de pie.
  "paddle-surf": {
    wind: { kind: "linear", goodKmh: 9, badKmh: 24, maxPenalty: 45, noGoKmh: 45 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 35, noGoM: 1.6 },
    period: { kind: "shorter-is-worse", goodS: 7, badS: 3, maxPenalty: 15 },
    waterTempMaxPenalty: 10,
    rainMaxPenalty: 15,
  },
  // Kayak de mar/recreo: agua plana manda. El chop de periodo corto es lo
  // que de verdad complica el kayak (embarca agua, inestable) a igualdad de
  // altura — comparación real citada en foros de navegación: "5 pies a 5 s
  // es muy duro, 5 pies a 10 s es un día precioso" (Bending Branches "Kayak
  // Fishing Safety: Swell and Wind" — sep. 2026).
  kayak: {
    wind: { kind: "linear", goodKmh: 12, badKmh: 28, maxPenalty: 42, noGoKmh: 38 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 35, noGoM: 1.3 },
    period: { kind: "shorter-is-worse", goodS: 7, badS: 4, maxPenalty: 14 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  // Viento contrastado con guías de kitesurf reales (en nudos, convertido a
  // km/h): principiante ideal 10-18 kt (18,5-33 km/h), <10 kt insuficiente,
  // aprietan a partir de 30 kt (55,6 km/h) (northernkites.co.uk,
  // kiteworldwide.com, windup.live — ago. 2026). El viento es EL factor que
  // decide si se puede practicar (sin viento no hay kite): sube de peso
  // frente a oleaje/periodo, que aquí son casi anecdóticos (se navega sobre
  // el agua, no depende de la calidad de la ola).
  kitesurf: {
    wind: { kind: "range", idealMinKmh: 18, idealMaxKmh: 33, hardMinKmh: 13, hardMaxKmh: 56, maxPenalty: 60, noGoKmh: 56 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.2, maxPenalty: 15, noGoM: 2.5 },
    period: { kind: "shorter-is-worse", goodS: 6, badS: 3, maxPenalty: 5 },
    waterTempMaxPenalty: 8,
    rainMaxPenalty: 15,
  },
  // Viento contrastado con guías de windsurf: principiante ideal 5-15 kt
  // (9-28 km/h), Force 3 (7-10 kt) el punto dulce; intermedio 15-25 kt
  // (airdsbay.co.uk, windup.live — ago. 2026). Misma lógica que kitesurf:
  // el viento manda, oleaje/periodo son secundarios.
  windsurf: {
    wind: { kind: "range", idealMinKmh: 13, idealMaxKmh: 28, hardMinKmh: 8, hardMaxKmh: 46, maxPenalty: 55, noGoKmh: 48 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.3, maxPenalty: 14, noGoM: 2.8 },
    period: { kind: "shorter-is-worse", goodS: 6, badS: 3, maxPenalty: 5 },
    waterTempMaxPenalty: 8,
    rainMaxPenalty: 15,
  },
  // Viento contrastado con guías de wingfoil: mínimo real 10-12 kt
  // (18,5-22 km/h) para levantar el foil, ideal 12-18 kt (22-33 km/h)
  // (pooleharbour.co.uk, mackiteboarding.com — ago. 2026). El viento decide
  // si el foil llega a volar: máximo peso de las tres disciplinas de viento.
  wingfoil: {
    wind: { kind: "range", idealMinKmh: 18, idealMaxKmh: 33, hardMinKmh: 13, hardMaxKmh: 46, maxPenalty: 58, noGoKmh: 56 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.4, maxPenalty: 12, noGoM: 3.0 },
    period: { kind: "shorter-is-worse", goodS: 6, badS: 3, maxPenalty: 4 },
    waterTempMaxPenalty: 8,
    rainMaxPenalty: 15,
  },
  // Viento: guías de buceo recomiendan no bucear en mar abierto con más de
  // Beaufort 4 (11-16 kt ≈ 20-30 km/h) (bsac.com, scubadoctor.com.au — ago.
  // 2026). El oleaje de superficie sigue mandando (entradas/salidas, oleaje
  // en superficie reduce visibilidad al remover sedimento — NJ Scuba "Wind,
  // Waves & Weather" — sep. 2026); el chop de periodo corto concretamente
  // reduce la luz que penetra el agua más que un mar de fondo suave a la
  // misma altura, así que sube de peso.
  buceo: {
    wind: { kind: "linear", goodKmh: 9, badKmh: 27, maxPenalty: 28, noGoKmh: 30 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 42, noGoM: 1.8 },
    period: { kind: "shorter-is-worse", goodS: 8, badS: 4, maxPenalty: 12 },
    waterTempMaxPenalty: 15,
    rainMaxPenalty: 8,
  },
  // Viento: evitar snorkel con viento sostenido por encima de 10-15 kt
  // (18,5-27,8 km/h) — remueve sedimento y reduce visibilidad
  // (conquerthewater.com, seaview180.com — ago. 2026). En snorkel se está
  // todo el rato con la cara en la superficie, así que el chop de periodo
  // corto (visibilidad, incomodidad) pesa más que en buceo.
  snorkel: {
    wind: { kind: "linear", goodKmh: 9, badKmh: 19, maxPenalty: 35, noGoKmh: 28 },
    wave: { kind: "linear", goodM: 0.2, badM: 0.7, maxPenalty: 45, noGoM: 1.3 },
    period: { kind: "shorter-is-worse", goodS: 8, badS: 4, maxPenalty: 10 },
    waterTempMaxPenalty: 12,
    rainMaxPenalty: 10,
  },
  apnea: {
    wind: { kind: "linear", goodKmh: 8, badKmh: 20, maxPenalty: 32, noGoKmh: 35 },
    wave: { kind: "linear", goodM: 0.2, badM: 0.8, maxPenalty: 42, noGoM: 1.5 },
    period: { kind: "shorter-is-worse", goodS: 8, badS: 4, maxPenalty: 10 },
    waterTempMaxPenalty: 14,
    rainMaxPenalty: 8,
  },
  // Viento: agua plana ideal con ≤5 kt (9,3 km/h); guías de esquí acuático
  // dicen que un principiante no debería salir con ≥10 kt (18,5 km/h)
  // (airhead.com — ago. 2026). Es el deporte que necesita el agua MÁS
  // plana de toda la tabla: cualquier chop (aunque sea de poca altura)
  // estropea directamente el deslizamiento, así que el periodo corto pesa
  // notablemente más que en el resto de agua plana/motor.
  "esqui-acuatico": {
    wind: { kind: "linear", goodKmh: 9, badKmh: 19, maxPenalty: 40, noGoKmh: 26 },
    wave: { kind: "linear", goodM: 0.15, badM: 0.5, maxPenalty: 46, noGoM: 1.0 },
    period: { kind: "shorter-is-worse", goodS: 10, badS: 5, maxPenalty: 12 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  wakeboard: {
    wind: { kind: "linear", goodKmh: 9, badKmh: 20, maxPenalty: 38, noGoKmh: 30 },
    wave: { kind: "linear", goodM: 0.15, badM: 0.6, maxPenalty: 44, noGoM: 1.1 },
    period: { kind: "shorter-is-worse", goodS: 10, badS: 5, maxPenalty: 12 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  // Moto de agua: motorizada, tolera bastante más chop que el resto de agua
  // plana — el periodo pesa poco (afecta a la comodidad a velocidad, no
  // impide la actividad).
  "moto-agua": {
    wind: { kind: "linear", goodKmh: 15, badKmh: 35, maxPenalty: 25, noGoKmh: 48 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.2, maxPenalty: 25, noGoM: 2.0 },
    period: { kind: "shorter-is-worse", goodS: 8, badS: 4, maxPenalty: 8 },
    waterTempMaxPenalty: 4,
    rainMaxPenalty: 10,
  },
  // Flyboard: propulsión por manguera desde una moto de agua, de pie sobre
  // un chorro de agua — necesita el agua más plana de todas (cualquier
  // chop desestabiliza mucho más que en el resto), de ahí el mayor peso de
  // oleaje y periodo de toda la tabla.
  flyboard: {
    wind: { kind: "linear", goodKmh: 8, badKmh: 20, maxPenalty: 40, noGoKmh: 30 },
    wave: { kind: "linear", goodM: 0.15, badM: 0.5, maxPenalty: 48, noGoM: 0.9 },
    period: { kind: "shorter-is-worse", goodS: 10, badS: 5, maxPenalty: 10 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 14,
  },
  // Remo (piragüismo de banco fijo, embarcaciones de poco francobordo): el
  // chop de periodo corto es justo lo que hace embarcar agua y complica
  // mantener una palada limpia, a igualdad de altura de ola.
  remo: {
    wind: { kind: "linear", goodKmh: 8, badKmh: 18, maxPenalty: 42, noGoKmh: 28 },
    wave: { kind: "linear", goodM: 0.2, badM: 0.6, maxPenalty: 45, noGoM: 1.0 },
    period: { kind: "shorter-is-worse", goodS: 8, badS: 4, maxPenalty: 12 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  // Viento: guías de vela ligera sitúan lo ideal para principiantes en 6-10
  // kt (11-18,5 km/h); a partir de 20 kt (37 km/h) la mayoría de dinghies
  // vuelven a puerto por el oleaje que genera (godownsize.com,
  // eoas.ubc.ca/Beaufort — ago. 2026). El viento sigue mandando (es lo que
  // mueve el barco), pero el chop de periodo corto también complica el
  // gobierno de un dinghy pequeño, así que sube algo de peso.
  vela: {
    wind: { kind: "range", idealMinKmh: 11, idealMaxKmh: 19, hardMinKmh: 7, hardMaxKmh: 37, maxPenalty: 48, noGoKmh: 37 },
    wave: { kind: "linear", goodM: 0.4, badM: 1.3, maxPenalty: 16, noGoM: 2.2 },
    period: { kind: "shorter-is-worse", goodS: 7, badS: 4, maxPenalty: 10 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  // Pesca desde playa/espigón/roca (el contexto real de la app — especies y
  // cebo por playa, ver FishingInfoCard): el peligro principal no es la
  // comodidad de un barco en mar abierto, es que una ola te alcance de
  // sopetón en la orilla o en unas rocas ("sneaker wave") — igual que en
  // baño/coasteering. Por eso el periodo se invierte respecto a los
  // deportes de flotación: uno largo (más energía en la rotura) suma
  // riesgo en vez de restarlo (PierSeeker "Fishing Pier Safety Tips":
  // olas que arrastran a gente de las zonas bajas de un espigón — sep.
  // 2026). El oleaje sube de peso por el mismo motivo.
  pesca: {
    wind: { kind: "linear", goodKmh: 15, badKmh: 35, maxPenalty: 25, noGoKmh: 45 },
    wave: { kind: "linear", goodM: 0.4, badM: 1.3, maxPenalty: 35, noGoM: 2.0 },
    period: { kind: "longer-is-worse", goodS: 6, badS: 11, maxPenalty: 20 },
    waterTempMaxPenalty: 4,
    rainMaxPenalty: 6,
  },
  // Coasteering: se avanza nadando/trepando pegado a rocas en la línea de
  // rotura — la misma exposición a golpes de mar y corrientes de retorno
  // que baño/pesca desde roca, así que mismo modelo de periodo invertido.
  coasteering: {
    wind: { kind: "linear", goodKmh: 12, badKmh: 30, maxPenalty: 28, noGoKmh: 45 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 38, noGoM: 1.8 },
    period: { kind: "longer-is-worse", goodS: 6, badS: 11, maxPenalty: 18 },
    waterTempMaxPenalty: 8,
    rainMaxPenalty: 15,
  },
  // Baño en la playa: el oleaje manda (ya era el factor de mayor peso) y el
  // periodo pasa a sumar riesgo con uno largo en vez de restarlo con uno
  // corto — la NOAA es explícita en que la fuerza de las corrientes de
  // retorno "aumenta con la altura Y el periodo del oleaje", y que un mar
  // de fondo largo puede verse engañosamente tranquilo en superficie y aun
  // así llevar mucha energía hacia la orilla (NOAA Ocean Service, "Rip
  // Current Science" — sep. 2026). Mismo umbral (11 s) que ya usa el
  // indicador de corrientes de retorno, ver lib/ripCurrentRisk.ts.
  bano: {
    wind: { kind: "linear", goodKmh: 15, badKmh: 35, maxPenalty: 22, noGoKmh: 45 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 42, noGoM: 1.6 },
    period: { kind: "longer-is-worse", goodS: 6, badS: 11, maxPenalty: 18 },
    waterTempMaxPenalty: 14,
    rainMaxPenalty: 20,
  },
  // Natación en aguas abiertas: mismo riesgo de corrientes de retorno que
  // baño, aunque suele nadarse más pegado a la costa (menos tiempo en la
  // zona de rotura) que alguien de pie en la orilla, de ahí un peso de
  // periodo algo menor que en baño/coasteering. El viento sube de peso: es
  // "la variable que más cambia todo" en las guías de aguas abiertas —a
  // partir de 15 mph (24 km/h) ya es solo para nadadores experimentados
  // (U.S. Masters Swimming, "How to Swim in Wavy Open Water Conditions" —
  // sep. 2026).
  "natacion-aguas-abiertas": {
    wind: { kind: "linear", goodKmh: 10, badKmh: 24, maxPenalty: 32, noGoKmh: 38 },
    wave: { kind: "linear", goodM: 0.2, badM: 0.7, maxPenalty: 45, noGoM: 1.3 },
    period: { kind: "longer-is-worse", goodS: 6, badS: 11, maxPenalty: 15 },
    waterTempMaxPenalty: 12,
    rainMaxPenalty: 10,
  },
};
