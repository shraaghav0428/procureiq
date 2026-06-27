"use client";

import { useAppStore } from "@/stores/app-store";
import { computeKPIs } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function KPICards() {
  const { selectedEvent } = useAppStore();
  const kpis = computeKPIs(selectedEvent);

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Key Metrics
      </h3>
      <div className="space-y-2">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-3 rounded-lg border border-border bg-background"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
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
            <p className="text-lg font-semibold text-foreground mt-0.5">
              {kpi.value}
            </p>
            {kpi.subtext && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {kpi.subtext}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
