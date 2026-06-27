"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AIRecommendation() {
  const {
    selectedEvent,
    persona,
    recommendation,
    isLoadingRecommendation,
    setRecommendation,
    setIsLoadingRecommendation,
  } = useAppStore();

  const retryCountRef = useRef(0);
  const maxRetries = 5;

  const fetchRecommendation = useCallback(async () => {
    setIsLoadingRecommendation(true);
    setRecommendation(null);
    let willRetry = false;
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          persona,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendation(data);
        retryCountRef.current = 0;
      } else if (response.status === 429 && retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        willRetry = true;
        setTimeout(fetchRecommendation, retryCountRef.current * 5000);
      }
    } catch (error) {
      console.error("Recommendation error:", error);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        willRetry = true;
        setTimeout(fetchRecommendation, retryCountRef.current * 5000);
      }
    } finally {
      if (!willRetry) setIsLoadingRecommendation(false);
    }
  }, [selectedEvent.id, persona]);

  useEffect(() => {
    retryCountRef.current = 0;
    fetchRecommendation();
  }, [selectedEvent.id, persona, fetchRecommendation]);

  return (
    <div>
      {isLoadingRecommendation ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="space-y-2 mt-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ) : recommendation ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base font-bold text-[#0070BB]">
                {recommendation.vendorName}
              </span>
              {recommendation.confidence >= 0.8 && (
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                  High Confidence
                </span>
              )}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {recommendation.answer}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              Evidence
            </h4>
            <ul className="space-y-1.5">
              {recommendation.evidence.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <ArrowRight className="w-3 h-3 text-[#0070BB] mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-[#0070BB]/5 border border-[#0070BB]/10">
            <p className="text-xs font-medium text-foreground">
              {recommendation.recommendation}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Trade-offs
            </h4>
            <ul className="space-y-1.5">
              {recommendation.tradeoffs.map((tradeoff, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-amber-500 mt-0.5 shrink-0">
                    &bull;
                  </span>
                  <span>{tradeoff}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load recommendation.
          </p>
          <button
            onClick={fetchRecommendation}
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
