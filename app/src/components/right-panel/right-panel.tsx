"use client";

import { AIRecommendation } from "./ai-recommendation";
import { Chat } from "./chat";
import { ProcurementSummaryCard } from "./procurement-summary";

export function RightPanel() {
  return (
    <aside className="w-[380px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 space-y-4">
          <AIRecommendation />
          <ProcurementSummaryCard />
        </div>
      </div>
      <Chat />
    </aside>
  );
}
