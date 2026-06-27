"use client";

import { useAppStore } from "@/stores/app-store";
import { WorkspaceToggle } from "./workspace-toggle";
import { EventSelector } from "./event-selector";
import { ExportButton } from "./export-button";
import { BrainCircuit } from "lucide-react";

export function Header() {
  const { selectedEvent } = useAppStore();

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ProcureIQ
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <EventSelector />
      </div>

      <div className="flex items-center gap-4">
        <WorkspaceToggle />
        <div className="h-6 w-px bg-border" />
        <ExportButton eventName={selectedEvent.name} />
      </div>
    </header>
  );
}
