"use client";

import { Header } from "@/components/header/header";
import { InsightBanner } from "@/components/insight-banner";
import { UniversalSearch } from "@/components/universal-search";
import { ComparisonTable } from "@/components/comparison-table";

export default function Home() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Section 1: Header */}
      <Header />

      {/* Section 2: AI Insight + Chat */}
      <div className="mx-4 mt-3 bg-card rounded-xl border border-border shadow-sm shrink-0">
        <InsightBanner />
        <UniversalSearch />
      </div>

      {/* Section 3 & 4: Comparison Table (includes legend + data table) */}
      <div className="mx-4 mt-3 mb-4 flex-1 min-h-0 flex flex-col">
        <ComparisonTable />
      </div>
    </div>
  );
}
