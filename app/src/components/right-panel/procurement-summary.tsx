"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProcurementSummaryCard() {
  const {
    selectedEvent,
    persona,
    summary,
    recommendation,
    isLoadingRecommendation,
    isLoadingSummary,
    setSummary,
    setIsLoadingSummary,
  } = useAppStore();

  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setSummary(null);
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
        const delay = retryCountRef.current * 5000;
        setTimeout(fetchSummary, delay);
        return;
      }
    } catch (error) {
      console.error("Summary error:", error);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        const delay = retryCountRef.current * 5000;
        setTimeout(fetchSummary, delay);
        return;
      }
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedEvent.id, persona]);

  useEffect(() => {
    retryCountRef.current = 0;
  }, [selectedEvent.id, persona]);

  useEffect(() => {
    if (recommendation && !isLoadingRecommendation) {
      const timer = setTimeout(fetchSummary, 2000);
      return () => clearTimeout(timer);
    }
  }, [recommendation, isLoadingRecommendation, fetchSummary]);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Procurement Summary
          </h3>
        </div>
        <button
          onClick={fetchSummary}
          disabled={isLoadingSummary}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw
            className={cn(
              "w-3.5 h-3.5",
              isLoadingSummary && "animate-spin"
            )}
          />
        </button>
      </div>

      <div className="p-4">
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

            <div className="p-3 rounded-lg bg-accent border border-primary/10">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-foreground">
                  {summary.recommendation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Failed to load summary. Click refresh to try again.
          </p>
        )}
      </div>
    </div>
  );
}
