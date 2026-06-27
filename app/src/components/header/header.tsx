"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { WorkspaceToggle } from "./workspace-toggle";
import { EventSelector } from "./event-selector";
import { ExportButton } from "./export-button";
import { BrainCircuit, Sparkles, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIRecommendation } from "@/components/right-panel/ai-recommendation";
import { ProcurementSummaryCard } from "@/components/right-panel/procurement-summary";

function SlidePanel({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="absolute top-0 right-0 h-full w-[420px] bg-card border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function Header() {
  const { selectedEvent } = useAppStore();
  const [recOpen, setRecOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0070BB] flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              ProcureIQ
            </span>
          </div>

          <div className="h-5 w-px bg-border" />
          <EventSelector />
          <div className="h-5 w-px bg-border" />
          <WorkspaceToggle />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setRecOpen(true)}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Recommendation
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setSummaryOpen(true)}
          >
            <FileText className="w-3.5 h-3.5" />
            Procurement Summary
          </Button>

          <div className="h-5 w-px bg-border" />
          <ExportButton eventName={selectedEvent.name} />
        </div>
      </header>

      <SlidePanel
        open={recOpen}
        onClose={() => setRecOpen(false)}
        title="AI Recommendation"
        description={`AI-generated vendor recommendation for ${selectedEvent.name}`}
      >
        <AIRecommendation />
      </SlidePanel>

      <SlidePanel
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Procurement Summary"
        description={`Executive summary for ${selectedEvent.name}`}
      >
        <ProcurementSummaryCard />
      </SlidePanel>
    </>
  );
}
