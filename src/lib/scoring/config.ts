import type { ActivityId, SkillLevel } from "../types";
import { buildActivityRules } from "./generateRules";
import { ACTIVITY_PROFILES } from "./profiles";
import type { ActivityLevelRules } from "./ruleTypes";

export type { ActivityLevelRules, ComfortRule, PeriodRule, WaveRule, WindRule } from "./ruleTypes";

type RulesTable = Record<ActivityId, Record<SkillLevel, ActivityLevelRules>>;

/**
 * Tabla completa de reglas (20 actividades × 3 niveles), generada desde los
 * perfiles base en profiles.ts — ver generateRules.ts para la lógica de
 * escalado por nivel. No se edita a mano: para ajustar el scoring de una
 * actividad, se edita su perfil en profiles.ts.
 */
export const ACTIVITY_RULES: RulesTable = Object.fromEntries(
  Object.entries(ACTIVITY_PROFILES).map(([id, profile]) => [id, buildActivityRules(profile)])
) as RulesTable;
