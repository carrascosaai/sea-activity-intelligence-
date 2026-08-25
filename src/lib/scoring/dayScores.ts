import type { ActivityId, ConditionSnapshot, HourlyScore, SkillLevel } from "../types";
import { scoreCondition } from "./engine";

export function buildHourlyScores(
  snapshots: ConditionSnapshot[],
  activity: ActivityId,
  level: SkillLevel
): HourlyScore[] {
  return snapshots.map((snapshot) => {
    const result = scoreCondition(activity, level, snapshot);
    return { time: snapshot.time, score: result.score, band: result.band, snapshot };
  });
}

export interface BestWindow {
  startTime: string;
  endTime: string;
  avgScore: number;
}

/**
 * Encuentra la mejor ventana horaria del día: parte de la hora con mayor
 * score y se expande a horas adyacentes mientras se mantengan razonablemente
 * cerca del máximo, con un límite de 4 horas para que siga siendo una
 * "ventana" y no todo el día.
 */
export function computeBestWindow(hourly: HourlyScore[]): BestWindow | null {
  if (hourly.length === 0) return null;

  let bestIdx = 0;
  for (let i = 1; i < hourly.length; i++) {
    if (hourly[i].score > hourly[bestIdx].score) bestIdx = i;
  }
  const maxScore = hourly[bestIdx].score;
  const threshold = maxScore - 10;
  const MAX_SPAN = 4;

  let start = bestIdx;
  let end = bestIdx;
  while (start > 0 && hourly[start - 1].score >= threshold && end - (start - 1) < MAX_SPAN) {
    start--;
  }
  while (end < hourly.length - 1 && hourly[end + 1].score >= threshold && end + 1 - start < MAX_SPAN) {
    end++;
  }

  const windowHours = hourly.slice(start, end + 1);
  const avgScore = Math.round(windowHours.reduce((sum, h) => sum + h.score, 0) / windowHours.length);

  const endHour = parseInt(hourly[end].time.split("T")[1]?.slice(0, 2) ?? "0", 10);
  const endTime = `${hourly[end].time.split("T")[0]}T${String((endHour + 1) % 24).padStart(2, "0")}:00`;

  return {
    startTime: hourly[start].time,
    endTime,
    avgScore,
  };
}

export function findClosestHourIndex(hourly: HourlyScore[], targetHour: number): number {
  if (hourly.length === 0) return -1;
  let closest = 0;
  let closestDiff = Infinity;
  hourly.forEach((h, i) => {
    const hour = parseInt(h.time.split("T")[1]?.slice(0, 2) ?? "0", 10);
    const diff = Math.abs(hour - targetHour);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = i;
    }
  });
  return closest;
}
