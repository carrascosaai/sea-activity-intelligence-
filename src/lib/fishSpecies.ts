export interface FishSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  bait: string;
}

/**
 * Catálogo de especies objetivo de pesca desde costa en España, con su
 * nombre científico — es la clave para cruzar con observaciones reales de
 * biodiversidad (ver scripts/generate-fish-occurrences.mjs / lib/fishOccurrences.ts).
 * El cebo es conocimiento piscatorio general y bien establecido, no una
 * medición nuestra.
 */
export const FISH_SPECIES: FishSpecies[] = [
  { id: "lubina", commonName: "Lubina", scientificName: "Dicentrarchus labrax", bait: "Cebo vivo (chipirón, sardina) o señuelo/vinilo" },
  { id: "dorada", commonName: "Dorada", scientificName: "Sparus aurata", bait: "Coquina, quisquilla o gusano coreano" },
  { id: "sargo", commonName: "Sargo", scientificName: "Diplodus sargus", bait: "Quisquilla, cangrejo o mejillón" },
  { id: "corvina", commonName: "Corvina", scientificName: "Argyrosomus regius", bait: "Calamar o chipirón entero, fondo" },
  { id: "congrio", commonName: "Congrio", scientificName: "Conger conger", bait: "Caballa o sardina en trozos grandes, de noche" },
  { id: "mujol", commonName: "Mújol", scientificName: "Mugil cephalus", bait: "Pan, masa o gusano" },
  { id: "choco", commonName: "Choco (sepia)", scientificName: "Sepia officinalis", bait: "Potera específica de choco" },
  { id: "pulpo", commonName: "Pulpo", scientificName: "Octopus vulgaris", bait: "Potera o cangrejo" },
  { id: "salema", commonName: "Salema / Salpa", scientificName: "Sarpa salpa", bait: "Pan o alga (especie mayormente herbívora)" },
  { id: "vieja", commonName: "Vieja", scientificName: "Sparisoma cretense", bait: "Lapa o marisco" },
  { id: "sama", commonName: "Sama", scientificName: "Dentex dentex", bait: "Gamba o pulpo en trozos" },
  { id: "breca", commonName: "Breca (pageles)", scientificName: "Pagellus erythrinus", bait: "Gamba o marisco" },
  { id: "chopa", commonName: "Chopa", scientificName: "Spondyliosoma cantharus", bait: "Marisco o alga" },
  { id: "lenguado", commonName: "Lenguado", scientificName: "Solea solea", bait: "Gusano o coquina, fondo arenoso" },
  { id: "bonito", commonName: "Bonito del norte", scientificName: "Sarda sarda", bait: "Cucharilla o señuelo, en curricán" },
  { id: "caballa", commonName: "Caballa", scientificName: "Scomber scombrus", bait: "Potera o cucharilla pequeña" },
  { id: "faneca", commonName: "Faneca", scientificName: "Trisopterus luscus", bait: "Gusano o marisco, fondo" },
];

export function getFishSpecies(id: string): FishSpecies | undefined {
  return FISH_SPECIES.find((s) => s.id === id);
}
