import type { SeaBasin } from "./seaBasin";

export interface SpeciesBait {
  species: string;
  bait: string;
}

export interface FishingInfo {
  basinLabel: string;
  speciesBait: SpeciesBait[];
  conditionTips: string[];
}

/**
 * Conocimiento general de pesca desde costa por cuenca marina — no hay
 * ningún dato abierto real que diga qué especie pica en una playa concreta
 * en un momento concreto, así que no lo inventamos con un % falso. Esto es
 * conocimiento ictiológico/piscatorio general y bien establecido de cada
 * zona (especie -> cebo habitual), presentado como orientación, no como
 * medición de esta playa exacta.
 */
export const FISHING_INFO: Record<SeaBasin, FishingInfo> = {
  cantabrico: {
    basinLabel: "Cantábrico",
    speciesBait: [
      { species: "Lubina", bait: "Cebo vivo (chipirón, sardina) o señuelo/vinilo" },
      { species: "Bonito del norte (en temporada)", bait: "Cucharilla o señuelo, en curricán desde embarcación" },
      { species: "Caballa", bait: "Potera o cucharilla pequeña" },
      { species: "Congrio", bait: "Caballa o sardina en trozos grandes, de noche" },
      { species: "Faneca", bait: "Gusano o marisco, fondo" },
    ],
    conditionTips: [
      "Con algo de oleaje que remueve el fondo, suele picar mejor al amanecer y al anochecer.",
      "Con mar muy plano en horas centrales del día, la pesca desde costa suele bajar bastante.",
    ],
  },
  "atlantico-galicia": {
    basinLabel: "Atlántico gallego",
    speciesBait: [
      { species: "Lubina / Robaliza", bait: "Cebo vivo o señuelo tipo vinilo/popper" },
      { species: "Congrio", bait: "Caballa o sardina entera, de noche" },
      { species: "Choco (sepia)", bait: "Potera específica de choco" },
      { species: "Sargo", bait: "Percebe, cangrejo o mejillón" },
      { species: "Dorada", bait: "Coquina o quisquilla" },
    ],
    conditionTips: [
      "En cambios de marea (subiendo o bajando) suele haber más actividad que en la marea parada.",
      "Con algo de oleaje moderado suele ir mejor que con el mar completamente plano.",
    ],
  },
  "atlantico-sur": {
    basinLabel: "Atlántico (Cádiz/Huelva)",
    speciesBait: [
      { species: "Lubina", bait: "Cebo vivo (chipirón) o señuelo" },
      { species: "Dorada", bait: "Coquina o gusano coreano" },
      { species: "Sargo", bait: "Quisquilla o cangrejo" },
      { species: "Corvina", bait: "Calamar o chipirón entero, fondo" },
      { species: "Lenguado", bait: "Gusano o coquina, fondo arenoso" },
    ],
    conditionTips: [
      "Tras un temporal, cuando el mar empieza a calmarse, suele ser un buen momento (arrastra comida a la orilla).",
      "Amanecer y anochecer suelen ser mejores que las horas centrales del día en verano.",
    ],
  },
  mediterraneo: {
    basinLabel: "Mediterráneo",
    speciesBait: [
      { species: "Dorada", bait: "Quisquilla o cangrejo" },
      { species: "Sargo", bait: "Mejillón, quisquilla o erizo" },
      { species: "Lubina", bait: "Cebo vivo o señuelo" },
      { species: "Mújol", bait: "Pan, masa o gusano" },
      { species: "Pulpo", bait: "Potera o cangrejo" },
    ],
    conditionTips: [
      "Con algo de oleaje de levante o poniente que enturbia el agua cerca de la orilla, suele picar mejor.",
      "Con el mar en calma total y mucho sol, la pesca de orilla en verano suele ser más floja.",
    ],
  },
  canarias: {
    basinLabel: "Canarias",
    speciesBait: [
      { species: "Vieja", bait: "Lapa o marisco" },
      { species: "Sama", bait: "Gamba o pulpo en trozos" },
      { species: "Breca (pageles)", bait: "Gamba o marisco" },
      { species: "Chopa", bait: "Marisco o alga" },
      { species: "Salema", bait: "Pan o alga (especie mayormente herbívora)" },
    ],
    conditionTips: [
      "Con algo de mar de fondo que mueve el agua junto a las rocas suele haber más actividad.",
      "Al atardecer, cuando baja el calor, suele mejorar la pesca respecto a mediodía.",
    ],
  },
};
