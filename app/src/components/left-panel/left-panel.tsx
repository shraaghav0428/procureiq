"use client";

import { KPICards } from "./kpi-cards";
import { SuggestedQuestions } from "./suggested-questions";

export function LeftPanel() {
  return (
    <aside className="w-[280px] shrink-0 border-r border-border bg-card overflow-y-auto scrollbar-thin">
      <div className="p-4 space-y-4">
        <KPICards />
        <SuggestedQuestions />
      </div>
    </aside>
  );
}
