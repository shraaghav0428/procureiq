"use client";

import { ComparisonTable } from "./comparison-table";

export function CenterPanel() {
  return (
    <main className="flex-1 overflow-hidden flex flex-col min-w-0">
      <ComparisonTable />
    </main>
  );
}
