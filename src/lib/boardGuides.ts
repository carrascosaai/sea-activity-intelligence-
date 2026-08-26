import type { ActivityId, SkillLevel } from "./types";

export type BoardShape = "shortboard" | "sup" | "bodyboard" | "twintip" | "windsurf" | "wingfoil" | "wakeboard";

export interface BoardSpec {
  level: SkillLevel;
  type: string;
  sizeLabel: string;
  volumeLabel: string;
  note: string;
}

export interface BoardGuide {
  shape: BoardShape;
  searchQuery: string;
  specs: BoardSpec[];
}

/**
 * Ficha técnica orientativa por deporte y nivel — medidas/volumen habituales
 * del sector (guías de compra reales, no una medición nuestra de ningún
 * producto concreto). No hay fotos de marcas: son ilustraciones propias
 * esquemáticas (ver BoardIllustration.tsx) para no usar imágenes con
 * derechos de terceros sin permiso.
 */
export const BOARD_GUIDES: Partial<Record<ActivityId, BoardGuide>> = {
  surf: {
    shape: "shortboard",
    searchQuery: "tabla de surf",
    specs: [
      {
        level: "principiante",
        type: "Evolutiva (foam)",
        sizeLabel: "8'0\" – 9'0\"",
        volumeLabel: "65 – 100 L",
        note: "Ancha y gruesa: flota y estabiliza, hace más fácil ponerse de pie.",
      },
      {
        level: "intermedio",
        type: "Funboard / híbrida",
        sizeLabel: "6'6\" – 7'6\"",
        volumeLabel: "40 – 55 L",
        note: "Más maniobrable, sigue perdonando algo de técnica imperfecta.",
      },
      {
        level: "avanzado",
        type: "Shortboard",
        sizeLabel: "5'8\" – 6'4\"",
        volumeLabel: "25 – 32 L",
        note: "Más rápida y precisa en giros, exige buena técnica de remada y pop-up.",
      },
    ],
  },
  "paddle-surf": {
    shape: "sup",
    searchQuery: "tabla de paddle surf sup",
    specs: [
      {
        level: "principiante",
        type: "All-around (a menudo hinchable)",
        sizeLabel: "10'6\" – 11'6\"",
        volumeLabel: "ancho 32\"+",
        note: "Muy estable, difícil de volcar, buena para aprender el equilibrio.",
      },
      {
        level: "intermedio",
        type: "All-around / touring",
        sizeLabel: "10' – 11'",
        volumeLabel: "ancho 30\" – 32\"",
        note: "Más rápida manteniendo bastante estabilidad.",
      },
      {
        level: "avanzado",
        type: "Race / performance",
        sizeLabel: "12'6\" – 14'",
        volumeLabel: "ancho 26\" – 29\"",
        note: "Más estrecha y rápida, exige más equilibrio.",
      },
    ],
  },
  bodyboard: {
    shape: "bodyboard",
    searchQuery: "bodyboard",
    specs: [
      { level: "principiante", type: "Core de PE, tabla grande", sizeLabel: "42\" – 44\"", volumeLabel: "—", note: "Más flotabilidad y perdón, ideal para coger las primeras olas." },
      { level: "intermedio", type: "Core de PE", sizeLabel: "41\" – 42\"", volumeLabel: "—", note: "Buen equilibrio entre flotabilidad y maniobrabilidad." },
      { level: "avanzado", type: "Core de PP", sizeLabel: "40\" – 41\"", volumeLabel: "—", note: "Más rígida y reactiva para maniobras, exige más nivel." },
    ],
  },
  kitesurf: {
    shape: "twintip",
    searchQuery: "tabla de kitesurf twintip",
    specs: [
      { level: "principiante", type: "Twin-tip grande y flotante", sizeLabel: "136 – 140 cm", volumeLabel: "—", note: "Mejor flotación y facilidad de water start; casi siempre con escuela/instructor." },
      { level: "intermedio", type: "Twin-tip medio", sizeLabel: "132 – 138 cm", volumeLabel: "—", note: "Más planeo con menos viento, sigue siendo perdonadora." },
      { level: "avanzado", type: "Twin-tip pequeña o directional", sizeLabel: "128 – 134 cm", volumeLabel: "—", note: "Más precisión para saltos y trucos, exige más viento o técnica." },
    ],
  },
  windsurf: {
    shape: "windsurf",
    searchQuery: "tabla de windsurf",
    specs: [
      { level: "principiante", type: "Muy ancha y estable", sizeLabel: "—", volumeLabel: "150+ L", note: "Prioriza flotabilidad total sobre velocidad, para aprender equilibrio." },
      { level: "intermedio", type: "Freeride", sizeLabel: "—", volumeLabel: "100 – 130 L", note: "Buen equilibrio entre estabilidad y planeo." },
      { level: "avanzado", type: "Freestyle / wave / slalom", sizeLabel: "—", volumeLabel: "70 – 100 L", note: "Más reactiva, exige buen nivel de planeo y viento." },
    ],
  },
  wingfoil: {
    shape: "wingfoil",
    searchQuery: "tabla de wingfoil",
    specs: [
      { level: "principiante", type: "Muy voluminosa + foil grande", sizeLabel: "—", volumeLabel: "100 – 150 L", note: "Facilita despegar y mantener el equilibrio sobre el foil." },
      { level: "intermedio", type: "Volumen medio + foil medio", sizeLabel: "—", volumeLabel: "80 – 110 L", note: "Más maniobrable manteniendo bastante estabilidad." },
      { level: "avanzado", type: "Poco volumen + foil pequeño/rápido", sizeLabel: "—", volumeLabel: "40 – 80 L", note: "Más velocidad y precisión, exige buen control del foil." },
    ],
  },
  wakeboard: {
    shape: "wakeboard",
    searchQuery: "tabla de wakeboard",
    specs: [
      { level: "principiante", type: "Larga, flex blando", sizeLabel: "134 – 138 cm", volumeLabel: "—", note: "Más perdonadora, facilita salir del agua y mantener el equilibrio." },
      { level: "intermedio", type: "Flex medio", sizeLabel: "138 – 142 cm", volumeLabel: "—", note: "Buen equilibrio entre estabilidad y respuesta en los giros." },
      { level: "avanzado", type: "Flex rígido, cantos agresivos", sizeLabel: "139 – 146 cm", volumeLabel: "—", note: "Más reactiva para saltos y trucos, exige buena técnica." },
    ],
  },
};
