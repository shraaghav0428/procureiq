"use client";

import { useAppStore } from "@/stores/app-store";
import { computeKPIs } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function KPIStrip() {
  const { selectedEvent } = useAppStore();
  const kpis = computeKPIs(selectedEvent);

  return (
    <div className="shrink-0 bg-[#F0F7FF] border-b border-[#D0E3F5] px-6 py-3">
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white/80 rounded-lg px-4 py-3 border border-[#D0E3F5]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                {kpi.label}
              </span>
              {kpi.trend && (
                <span>
                  {kpi.trend === "up" && (
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  )}
                  {kpi.trend === "down" && (
                    <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                  )}
                  {kpi.trend === "neutral" && (
                    <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-foreground mt-1">
              {kpi.value}
            </p>
            {kpi.subtext && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {kpi.subtext}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
