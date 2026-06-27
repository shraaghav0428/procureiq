"use client";

import { Header } from "@/components/header/header";
import { KPIStrip } from "@/components/kpi-strip";
import { ComparisonTable } from "@/components/comparison-table";
import { FloatingChat } from "@/components/floating-chat";

export default function Home() {
  return (
    <div className="h-full flex flex-col bg-background">
      <Header />
      <KPIStrip />
      <div className="flex-1 overflow-auto">
        <ComparisonTable />
      </div>
      <FloatingChat />
    </div>
  );
}
