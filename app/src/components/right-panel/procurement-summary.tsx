"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

export function ProcurementSummaryCard() {
  const {
    selectedEvent,
    persona,
    summary,
    isLoadingSummary,
    setSummary,
    setIsLoadingSummary,
  } = useAppStore();

  const retryCountRef = useRef(0);
  const maxRetries = 5;

  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setSummary(null);
    let willRetry = false;
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          persona,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        retryCountRef.current = 0;
      } else if (response.status === 429 && retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        willRetry = true;
        setTimeout(fetchSummary, retryCountRef.current * 5000);
      }
    } catch (error) {
      console.error("Summary error:", error);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        willRetry = true;
        setTimeout(fetchSummary, retryCountRef.current * 5000);
      }
    } finally {
      if (!willRetry) setIsLoadingSummary(false);
    }
  }, [selectedEvent.id, persona]);

  useEffect(() => {
    retryCountRef.current = 0;
  }, [selectedEvent.id, persona]);

  useEffect(() => {
    if (!summary && !isLoadingSummary) {
      fetchSummary();
    }
  }, [selectedEvent.id, persona]);

  return (
    <div>
      {isLoadingSummary ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-full mt-4" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : summary ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            {summary.overview}
          </p>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              Key Findings
            </h4>
            <ul className="space-y-1.5">
              {summary.keyFindings.map((finding, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="text-green-600 mt-0.5 shrink-0">
                    &bull;
                  </span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Risks
            </h4>
            <ul className="space-y-1.5">
              {summary.risks.map((risk, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 shrink-0">
                    &bull;
                  </span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-accent border border-[#0070BB]/10">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#0070BB] mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-foreground">
                {summary.recommendation}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load summary.
          </p>
          <button
            onClick={fetchSummary}
            className="text-xs text-[#0070BB] hover:underline flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
