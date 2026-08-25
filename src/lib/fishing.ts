import type { SeaBasin } from "./seaBasin";

export interface FishingInfo {
  basinLabel: string;
  species: string[];
  baitTip: string;
  conditionTips: string[];
}

/**
 * Conocimiento general de pesca desde costa por cuenca marina — no hay
 * ningún dato abierto real que diga qué especie pica en una playa concreta
 * en un momento concreto, así que no lo inventamos con un % falso. Esto es
 * conocimiento ictiológico/piscatorio general y bien establecido de cada
 * zona, presentado como orientación, no como medición.
 */
export const FISHING_INFO: Record<SeaBasin, FishingInfo> = {
  cantabrico: {
    basinLabel: "Cantábrico",
    species: ["Lubina", "Bonito del norte (en temporada)", "Caballa", "Congrio", "Faneca"],
    baitTip: "Cebo generalista: gusano coreano o cangrejo. Para lubina, mejor cebo vivo o señuelo.",
    conditionTips: [
      "Con algo de oleaje que remueve el fondo, suele picar mejor al amanecer y al anochecer.",
      "Con mar muy plano en horas centrales del día, la pesca desde costa suele bajar bastante.",
    ],
  },
  "atlantico-galicia": {
    basinLabel: "Atlántico gallego",
    species: ["Lubina / Robaliza", "Congrio", "Choco (sepia)", "Sargo", "Dorada"],
    baitTip: "Marisco o gusano para sargo/dorada; cebo vivo o señuelo para lubina; potera para choco.",
    conditionTips: [
      "En cambios de marea (subiendo o bajando) suele haber más actividad que en la marea parada.",
      "Con algo de oleaje moderado suele ir mejor que con el mar completamente plano.",
    ],
  },
  "atlantico-sur": {
    basinLabel: "Atlántico (Cádiz/Huelva)",
    species: ["Lubina", "Dorada", "Sargo", "Corvina", "Lenguado", "Mújol"],
    baitTip: "Coquina o gusano para dorada/sargo; cebo vivo para lubina y corvina.",
    conditionTips: [
      "Tras un temporal, cuando el mar empieza a calmarse, suele ser un buen momento (arrastra comida a la orilla).",
      "Amanecer y anochecer suelen ser mejores que las horas centrales del día en verano.",
    ],
  },
  mediterraneo: {
    basinLabel: "Mediterráneo",
    species: ["Dorada", "Sargo", "Lubina", "Mújol", "Salpa", "Pulpo"],
    baitTip: "Marisco (quisquilla, cangrejo) para sargo/dorada; para pulpo, potera o cangrejo.",
    conditionTips: [
      "Con algo de oleaje de levante o poniente que enturbia el agua cerca de la orilla, suele picar mejor.",
      "Con el mar en calma total y mucho sol, la pesca de orilla en verano suele ser más floja.",
    ],
  },
  canarias: {
    basinLabel: "Canarias",
    species: ["Vieja", "Sama", "Breca (pageles)", "Chopa", "Salema"],
    baitTip: "Lapa o marisco para vieja/sama; gamba para breca y chopa.",
    conditionTips: [
      "Con algo de mar de fondo que mueve el agua junto a las rocas suele haber más actividad.",
      "Al atardecer, cuando baja el calor, suele mejorar la pesca respecto a mediodía.",
    ],
  },
};
