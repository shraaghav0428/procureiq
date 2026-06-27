"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function ExportButton({ eventName }: { eventName: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const { recommendation, summary, selectedEvent } = useAppStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { generatePDF } = await import("@/lib/export/pdf");
      await generatePDF(selectedEvent, recommendation, summary);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      Export PDF
    </Button>
  );
}
