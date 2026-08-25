# VALIDATION.md — Sea Activity Intelligence

> **Nota (ampliación nacional):** este documento se escribió cuando el alcance era 3
> actividades y Costa del Sol. Por petición explícita del usuario, el producto se amplió
> a 20 actividades y cobertura nacional (~3.600 playas) antes de recoger datos de uso
> real — es decir, antes de poder aplicar los criterios de la sección 10 de este mismo
> documento. Las hipótesis, el hueco de mercado y los criterios de éxito/abandono siguen
> siendo válidos tal cual; lo que cambia es que ahora hay más superficie de producto que
> validar con el mismo nivel de evidencia (cero, todavía). Ver README.md y TODO.md para
> el estado técnico real.

## 1. Problema

Una persona que quiere hacer una actividad acuática (surf, paddle surf, kayak, buceo, etc.)
tiene que consultar varias fuentes (viento, oleaje, mareas, temperatura, lluvia) y luego
interpretar manualmente si esas condiciones son buenas para SU actividad y SU nivel.

Ese paso de interpretación — de datos crudos a una decisión — no lo resuelve ninguna app
meteorológica ni de surf actual. El usuario hace el trabajo de "traducir" datos a decisión
él mismo, cada vez.

## 2. Usuario objetivo

- Practicante recreativo/amateur de deportes acuáticos (principiante-intermedio), no
  profesional ni competidor: ya sabe leer un parte de olas con precisión.
- Vive o viaja a una zona costera concreta (Costa del Sol en el MVP) y decide "¿hago algo
  hoy, y qué, y cuándo?" con antelación de horas a 1-2 días.
- Perfil secundario (fase posterior, no MVP): escuelas/alquileres locales que quieren
  captar clientes en el momento en que las condiciones son buenas para su actividad.

## 3. Hipótesis

**H1 (producto):** la gente prefiere una recomendación binaria/graduada por actividad y
nivel ("puedes hacer paddle surf ahora, score 91") sobre datos crudos de viento/oleaje,
porque elimina el trabajo de interpretación.

**H2 (comportamiento):** cuando el sistema dice "esto no es lo tuyo pero X está mejor",
el usuario cambia de actividad o de hora en vez de abandonar la app.

**H3 (negocio):** ese momento de decisión ("condiciones buenas ahora") es un punto de
conversión más fuerte para dirigir tráfico a escuelas/alquileres locales que la publicidad
genérica, porque el usuario ya está listo para actuar.

Validaremos H1 y H2 primero (uso real, retención de sesión, elección de "mejor ventana"),
H3 después de tener tráfico recurrente.

## 4. Competidores y hueco de mercado

| Producto | Qué resuelve | Qué NO resuelve |
|---|---|---|
| Windy | Visualización meteorológica muy completa (viento, olas, modelos) | No traduce a "puedo hacer X". Exige que el usuario sepa interpretar. |
| Surfline | Previsión de surf, cámaras, ratings de olas | Centrado solo en surf; rating genérico, no por nivel del usuario; multi-actividad no existe. |
| Magicseaweed (fusionado en Surfline) | Igual que Surfline, legado | Igual limitación. |
| Windguru | Tablas de modelos meteorológicos muy densas | Requiere expertise para leerlas; cero traducción a decisión; no piensa en actividad/nivel. |
| Meteoblue | Previsión meteo general, buena precisión | No es específico de mar/actividades acuáticas. |
| Apps de mareas (Tide Times, etc.) | Solo mareas | Dato aislado, sin contexto de actividad. |
| Apps de reserva (GetMyBoat, Civitatis, etc.) | Reservar una actividad ya decidida | No ayudan a decidir SI y CUÁNDO hacerla; asumen que el usuario ya sabe. |

**El hueco:** todas estas herramientas se detienen en "aquí tienes los datos". Ninguna
llega hasta "esto es lo que deberías hacer, aquí, ahora, y por qué". Ese es el producto:
una capa de decisión sobre datos de terceros, no una fuente de datos más.

## 5. Diferenciación

1. **Activity Score específico por actividad + nivel**, no un rating meteorológico único.
2. **Multi-actividad comparativo**: no solo "¿puedo hacer surf?" sino "¿qué debería hacer
   hoy, de todo lo disponible?".
3. **Explicabilidad**: cada recomendación dice el POR QUÉ en lenguaje llano, no solo cifras.
4. **Mejor ventana horaria**, no solo el estado actual.
5. Lenguaje de seguridad responsable (nunca "es seguro", siempre condicional y con aviso).

## 6. Modelo de negocio (diseño, no todo en MVP)

- **Leads/afiliación**: enlaces de reserva hacia escuelas/alquileres locales cuando el
  score es alto (`booking_links`, `businesses` en el modelo de datos).
- **Premium** (fase posterior): alertas de "mejor ventana" por push/email, histórico,
  favoritos avanzados, previsión extendida.
- **Reservas propias**: descartado para MVP; solo redirección con tracking (`business_clicked`,
  `booking_clicked`) para medir intención antes de construir un marketplace.

## 7. MVP (qué se construye ahora)

Ver TODO.md para el desglose P0. Resumen: landing → selector actividad/ubicación/nivel/fecha
→ score real (datos de Open-Meteo) → recomendación con explicación → mejor ventana →
comparación horaria del día → mapa de la Costa del Sol → modo "¿qué puedo hacer hoy?" →
analítica básica de eventos.

Explícitamente fuera de alcance: apps móviles nativas, login obligatorio, pagos, marketplace
de reservas, chat con IA, comunidad/social, gamificación.

## 8. Métricas de validación

- **Activación**: % de visitantes que completan el flujo hasta ver un score.
- **Profundidad de uso**: % que abre la comparación horaria o el modo "qué puedo hacer hoy".
- **Señal de confianza**: % que vuelve a usar el producto en los siguientes 7 días con una
  ubicación/actividad ya usada antes (proxy de "confío en esta recomendación").
- **Intención comercial**: clics en `business_clicked` / `booking_clicked` como % de
  recomendaciones verdes mostradas.
- **Reencuadre de actividad**: cuántas veces el usuario acepta la sugerencia alternativa
  ("mejor haz kayak que paddle surf") medido por cambio de selección tras verla.

## 9. Riesgos

- **Calidad de datos**: los proveedores gratuitos (Open-Meteo) pueden tener menor precisión
  local que fuentes de pago (StormGlass, Puertos del Estado/AEMET). Mitigado por la capa de
  abstracción `WeatherProvider`/`MarineProvider` — cambiar de proveedor no rompe el producto.
- **Responsabilidad/seguridad**: recomendar una actividad acuática tiene riesgo físico real.
  Mitigado con lenguaje no absoluto y aviso legal visible siempre (ver punto 13 del brief).
- **Reglas de scoring arbitrarias al inicio**: sin datos de uso real, los pesos son estimaciones
  de experto, no aprendidas. Se documentan como versionables (`activity_rules` en BD) para
  poder ajustarlas sin redeploy de código.
- **Zona geográfica pequeña**: validar con 7 localizaciones de Costa del Sol antes de escalar
  puede dar señal débil si el tráfico inicial es bajo. Mitigado priorizando distribución local
  (grupos de surf/kayak, escuelas) antes que adquisición genérica.

## 10. Criterios para continuar

- Al menos el 40% de las sesiones que llegan al selector de actividad completan el flujo
  hasta ver un resultado.
- Uso recurrente real: usuarios que vuelven a consultar en una semana distinta.
- Alguna escuela/negocio local dispuesto a recibir leads gratis a cambio de feedback
  (validación de la hipótesis de negocio, no solo de producto).

## 11. Criterios para abandonar / pivotar

- Los usuarios prefieren seguir mirando los datos crudos y consideran el score "poco fiable"
  de forma consistente (feedback cualitativo negativo repetido).
- Ninguna intención comercial medible (cero clics en `business_clicked` tras varias semanas
  con tráfico real).
- Coste/calidad de datos meteorológicos hace inviable mantener precisión aceptable sin pasar
  a proveedores de pago que no se puedan costear con el tráfico obtenido.
