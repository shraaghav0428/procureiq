"use client";

import { Header } from "@/components/header/header";
import { InsightBanner } from "@/components/insight-banner";
import { UniversalSearch } from "@/components/universal-search";
import { ComparisonTable } from "@/components/comparison-table";
import { ChatPanel } from "@/components/chat-panel";
import { useAppStore } from "@/stores/app-store";

export default function Home() {
  const { isChatPanelOpen } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Section 1: Header */}
      <Header />

      {/* Main content: table + optional chat panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: insight + search + table */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Section 2: AI Insight + Search */}
          <div className="mx-4 mt-3 bg-card rounded-xl border border-border shadow-sm shrink-0">
            <InsightBanner />
            <UniversalSearch />
          </div>

          {/* Section 3 & 4: Comparison Table */}
          <div className="mx-4 mt-3 mb-4 flex-1 min-h-0 flex flex-col">
            <ComparisonTable />
          </div>
        </div>

        {/* Right: Chat panel */}
        {isChatPanelOpen && <ChatPanel />}
      </div>
    </div>
  );
}
