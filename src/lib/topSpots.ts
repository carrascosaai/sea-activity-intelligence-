import type { ActivityId } from "./types";

export interface TopSpot {
  name: string;
  region: string;
  locationSlug?: string;
  why: string;
  bestSeason: string;
}

export interface ActivitySpotGuide {
  headline: string;
  spots: TopSpot[];
}

/**
 * Sitios de referencia real en España por deporte — reputación conocida del
 * sector (revistas especializadas, federaciones, sedes de campeonatos), no
 * un ranking calculado por nosotros. "Mejor temporada" es orientación
 * general y real (p. ej. el levante en Tarifa es más constante en verano),
 * nunca un día/hora fijo inventado — para eso está el buscador en tiempo
 * real de cada playa (enlace "Ver condiciones ahora").
 */
export const TOP_SPOTS: Partial<Record<ActivityId, ActivitySpotGuide>> = {
  surf: {
    headline: "El norte (Cantábrico) tiene el oleaje más consistente; Canarias funciona bien todo el año por los alisios.",
    spots: [
      {
        name: "Mundaka",
        region: "País Vasco",
        locationSlug: "laida-bermeo",
        why: "Ola izquierda de río de referencia mundial, antigua sede del circuito WSL.",
        bestSeason: "Otoño e invierno, cuando llegan los grandes swells de norte del Atlántico.",
      },
      {
        name: "Zurriola / Zarautz",
        region: "País Vasco",
        locationSlug: "zurriola-donostia-san-sebastian",
        why: "La mayor concentración de escuelas de surf de España, ola consistente para todos los niveles.",
        bestSeason: "Todo el año; otoño-invierno para más tamaño de ola.",
      },
      {
        name: "Rodiles",
        region: "Asturias",
        locationSlug: "playa-de-rodiles-villaviciosa",
        why: "Una de las mejores derechas de la costa asturiana, en la desembocanza de la ría de Villaviciosa.",
        bestSeason: "Otoño e invierno.",
      },
      {
        name: "Pantín",
        region: "Galicia",
        locationSlug: "praia-de-pantin-cedeira",
        why: "Sede histórica del Pantín Classic Pro, una de las pruebas más antiguas del surf europeo.",
        bestSeason: "Verano (el campeonato se celebra en septiembre) y otoño.",
      },
      {
        name: "Somo / Loredo",
        region: "Cantabria",
        locationSlug: "playa-de-somo-santander",
        why: "Playa muy larga y accesible, referencia del surf cántabro para todos los niveles.",
        bestSeason: "Todo el año.",
      },
      {
        name: "El Cotillo / La Pared",
        region: "Canarias (Fuerteventura)",
        why: "Olas potentes y constantes gracias a los alisios, prácticamente todo el año.",
        bestSeason: "Todo el año, especialmente otoño-invierno para más tamaño.",
      },
      {
        name: "El Palmar / Conil",
        region: "Andalucía",
        locationSlug: "playa-de-el-palmar-conil-de-la-frontera",
        why: "Referencia del surf en el sur, playa larga con varios picos.",
        bestSeason: "Otoño e invierno.",
      },
    ],
  },
  bodyboard: {
    headline: "Comparte casi los mismos spots que el surf — cualquier playa con buena ola de orilla funciona.",
    spots: [
      {
        name: "Mundaka / Laida",
        region: "País Vasco",
        locationSlug: "laida-bermeo",
        why: "Ola potente y hueca, muy valorada también en bodyboard.",
        bestSeason: "Otoño e invierno.",
      },
      {
        name: "Somo / Loredo",
        region: "Cantabria",
        locationSlug: "playa-de-somo-santander",
        why: "Ola de orilla accesible y consistente.",
        bestSeason: "Todo el año.",
      },
      {
        name: "El Palmar / Conil",
        region: "Andalucía",
        locationSlug: "playa-de-el-palmar-conil-de-la-frontera",
        why: "Playa abierta con buena ola de shore break.",
        bestSeason: "Otoño e invierno.",
      },
    ],
  },
  kitesurf: {
    headline: "Tarifa es la referencia nacional e internacional; Canarias es la alternativa fuerte todo el año.",
    spots: [
      {
        name: "Tarifa (Valdevaqueros / Los Lances)",
        region: "Andalucía",
        locationSlug: "playa-de-valdevaqueros-tarifa",
        why: "La 'capital europea del viento': levante y poniente prácticamente garantizados en verano.",
        bestSeason: "Verano, cuando el levante sopla con más constancia.",
      },
      {
        name: "El Médano",
        region: "Canarias (Tenerife)",
        locationSlug: "playa-de-el-medano-granadilla-de-abona",
        why: "Alisios constantes casi todo el año, sede de campeonatos internacionales de kite y windsurf.",
        bestSeason: "Todo el año, especialmente primavera-verano.",
      },
      {
        name: "Fuerteventura (Sotavento de Jandía)",
        region: "Canarias",
        why: "Sede histórica del Mundial de Fuerteventura (kite y windsurf), viento muy constante.",
        bestSeason: "Todo el año, verano para más intensidad.",
      },
      {
        name: "Empuriabrava / Roses",
        region: "Cataluña",
        locationSlug: "platja-d-empuriabrava-roses",
        why: "La Tramontana la convierte en la referencia del kitesurf mediterráneo.",
        bestSeason: "Invierno y primavera, cuando sopla la Tramontana.",
      },
    ],
  },
  windsurf: {
    headline: "Mismos spots que el kitesurf casi siempre: donde hay viento constante, hay windsurf.",
    spots: [
      {
        name: "Tarifa",
        region: "Andalucía",
        locationSlug: "playa-de-los-lances-tarifa",
        why: "Viento de levante/poniente muy constante, cuna del windsurf en España.",
        bestSeason: "Verano.",
      },
      {
        name: "El Médano",
        region: "Canarias (Tenerife)",
        locationSlug: "playa-de-el-medano-granadilla-de-abona",
        why: "Alisios constantes, sede de pruebas del circuito mundial de windsurf (PWA).",
        bestSeason: "Todo el año.",
      },
      {
        name: "Fuerteventura (Sotavento de Jandía)",
        region: "Canarias",
        why: "Aguas planas con viento fuerte, ideal para freestyle y slalom.",
        bestSeason: "Todo el año.",
      },
    ],
  },
  wingfoil: {
    headline: "Deporte muy nuevo: comparte casi siempre los spots de viento del kitesurf/windsurf.",
    spots: [
      {
        name: "Tarifa",
        region: "Andalucía",
        locationSlug: "playa-de-valdevaqueros-tarifa",
        why: "Viento constante y comunidad de wingfoil en pleno crecimiento.",
        bestSeason: "Verano.",
      },
      {
        name: "El Médano",
        region: "Canarias (Tenerife)",
        locationSlug: "playa-de-el-medano-granadilla-de-abona",
        why: "Alisios constantes, cada vez más escuelas ofrecen wingfoil.",
        bestSeason: "Todo el año.",
      },
    ],
  },
  "paddle-surf": {
    headline: "Al contrario que el surf, aquí lo mejor es agua tranquila y protegida.",
    spots: [
      {
        name: "Mar Menor",
        region: "Región de Murcia",
        locationSlug: "playa-de-la-llana-san-pedro-del-pinatar",
        why: "Laguna salada prácticamente sin oleaje, ideal para iniciarse y para SUP de larga distancia.",
        bestSeason: "Primavera y verano.",
      },
      {
        name: "Ría de Vigo / Illas Cíes",
        region: "Galicia",
        why: "Aguas protegidas y transparentes dentro de un parque nacional.",
        bestSeason: "Verano.",
      },
      {
        name: "Costa Brava (Illes Medes)",
        region: "Cataluña",
        why: "Calas resguardadas y aguas muy claras.",
        bestSeason: "Primavera a otoño.",
      },
    ],
  },
  vela: {
    headline: "La Bahía de Palma y Santander son las dos grandes referencias históricas de la vela española.",
    spots: [
      {
        name: "Bahía de Palma",
        region: "Islas Baleares",
        why: "Sede histórica de la Copa del Rey de Vela, viento térmico (embat) muy regular en verano.",
        bestSeason: "Verano.",
      },
      {
        name: "Bahía de Santander",
        region: "Cantabria",
        locationSlug: "playa-de-la-concha-santander",
        why: "Bahía resguardada con tradición vélica y varios clubs náuticos.",
        bestSeason: "Verano.",
      },
    ],
  },
  buceo: {
    headline: "Las reservas marinas protegidas concentran la mejor visibilidad y biodiversidad.",
    spots: [
      {
        name: "Illes Medes",
        region: "Cataluña",
        why: "Reserva marina de referencia nacional, gran densidad de vida marina en poca profundidad.",
        bestSeason: "Primavera a otoño, mejor visibilidad en verano.",
      },
      {
        name: "Cabo de Gata-Níjar",
        region: "Andalucía",
        locationSlug: "playa-de-san-miguel-de-cabo-de-gata-almeria",
        why: "Parque natural con fondos volcánicos y muy buena visibilidad.",
        bestSeason: "Verano y principios de otoño.",
      },
      {
        name: "Islas Cíes",
        region: "Galicia",
        why: "Parque nacional, aguas muy transparentes para ser Atlántico.",
        bestSeason: "Verano.",
      },
      {
        name: "Costa de Ibiza y Formentera",
        region: "Islas Baleares",
        why: "Praderas de posidonia protegidas, muy buena visibilidad.",
        bestSeason: "Verano y principios de otoño.",
      },
    ],
  },
  snorkel: {
    headline: "Los mismos parques y reservas marinas del buceo funcionan igual de bien para snorkel, sin necesitar equipo técnico.",
    spots: [
      {
        name: "Illes Medes",
        region: "Cataluña",
        why: "Vida marina visible ya en pocos metros de profundidad.",
        bestSeason: "Verano.",
      },
      {
        name: "Cabo de Gata-Níjar",
        region: "Andalucía",
        locationSlug: "playa-de-san-miguel-de-cabo-de-gata-almeria",
        why: "Calas de aguas claras y fondos rocosos accesibles desde la orilla.",
        bestSeason: "Verano.",
      },
      {
        name: "Costa de Ibiza y Formentera",
        region: "Islas Baleares",
        why: "Posidonia y aguas muy transparentes.",
        bestSeason: "Verano.",
      },
    ],
  },
};
