"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

export function ClientAnalyticsPing({ event, payload }: { event: AnalyticsEvent; payload: Record<string, unknown> }) {
  useEffect(() => {
    track(event, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
