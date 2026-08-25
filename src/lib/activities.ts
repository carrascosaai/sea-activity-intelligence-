import type { ActivityCategory, ActivityDef, ActivityId } from "./types";

/**
 * Deportes de mar/costa (y el "baño", que no es deporte pero es la pregunta
 * más común de todas — "¿puedo bañarme ahora?"). Deliberadamente NO incluimos
 * deportes de piscina/competición (natación en piscina, waterpolo, saltos,
 * natación sincronizada) ni deportes de río (rafting, barranquismo de agua
 * dulce): el modelo de datos de la app es 100% costero (MarineProvider =
 * oleaje de mar), así que cualquier actividad sin relación real con el
 * estado del mar/viento en la costa queda fuera por diseño, no por olvido.
 */
export const ACTIVITIES: ActivityDef[] = [
  { id: "surf", name: "Surf", shortName: "Surf", emoji: "🏄", category: "tabla" },
  { id: "paddle-surf", name: "Paddle Surf", shortName: "Paddle Surf", emoji: "🏄‍♂️", category: "tabla" },
  { id: "bodyboard", name: "Bodyboard", shortName: "Bodyboard", emoji: "🏄‍♀️", category: "tabla" },
  { id: "kitesurf", name: "Kitesurf", shortName: "Kitesurf", emoji: "🪁", category: "tabla" },
  { id: "windsurf", name: "Windsurf", shortName: "Windsurf", emoji: "🎏", category: "tabla" },
  { id: "wingfoil", name: "Wingfoil", shortName: "Wingfoil", emoji: "🦅", category: "tabla" },

  { id: "kayak", name: "Kayak", shortName: "Kayak", emoji: "🛶", category: "remo-vela" },
  { id: "remo", name: "Remo", shortName: "Remo", emoji: "🚣", category: "remo-vela" },
  { id: "vela", name: "Vela / Navegación", shortName: "Vela", emoji: "⛵", category: "remo-vela" },

  { id: "buceo", name: "Buceo", shortName: "Buceo", emoji: "🤿", category: "submarinismo" },
  { id: "snorkel", name: "Snorkel", shortName: "Snorkel", emoji: "🐠", category: "submarinismo" },
  { id: "apnea", name: "Apnea / Buceo libre", shortName: "Apnea", emoji: "🫁", category: "submarinismo" },

  { id: "esqui-acuatico", name: "Esquí acuático", shortName: "Esquí acuático", emoji: "🎿", category: "motor" },
  { id: "wakeboard", name: "Wakeboard", shortName: "Wakeboard", emoji: "🏂", category: "motor" },
  { id: "moto-agua", name: "Moto de agua", shortName: "Moto de agua", emoji: "🚤", category: "motor" },
  { id: "flyboard", name: "Flyboard", shortName: "Flyboard", emoji: "🚀", category: "motor" },

  { id: "pesca", name: "Pesca", shortName: "Pesca", emoji: "🎣", category: "otros" },
  { id: "coasteering", name: "Coasteering", shortName: "Coasteering", emoji: "🧗", category: "otros" },
  { id: "bano", name: "Baño en la playa", shortName: "Baño", emoji: "🏖️", category: "otros" },
  { id: "natacion-aguas-abiertas", name: "Natación en aguas abiertas", shortName: "Natación", emoji: "🏊", category: "otros" },
];

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  tabla: "Tabla y deslizamiento",
  "remo-vela": "Remo y vela",
  submarinismo: "Submarinismo",
  motor: "Motor",
  otros: "Otros",
};

export const CATEGORY_ORDER: ActivityCategory[] = ["tabla", "remo-vela", "submarinismo", "motor", "otros"];

export function getActivity(id: ActivityId): ActivityDef {
  const found = ACTIVITIES.find((a) => a.id === id);
  if (!found) throw new Error(`Actividad desconocida: ${id}`);
  return found;
}

export const SKILL_LEVELS: { id: "principiante" | "intermedio" | "avanzado"; label: string }[] = [
  { id: "principiante", label: "Principiante" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
];
