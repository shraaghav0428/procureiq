import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  SourcingEvent,
  AIRecommendation,
  ProcurementSummary,
} from "@/types";
import { computeKPIs, formatCurrency } from "@/lib/utils";

export async function generatePDF(
  event: SourcingEvent,
  recommendation: AIRecommendation | null,
  summary: ProcurementSummary | null
) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [0, 112, 187];
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ProcureIQ", 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI Procurement Analyst Report", 14, 24);
  doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), 14, 30);

  y = 45;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(event.name, 14, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(event.description, 14, y, { maxWidth: pageWidth - 28 });
  y += 12;

  const kpis = computeKPIs(event);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Key Metrics", 14, y);
  y += 7;

  const kpiData = kpis.map((k) => [k.label, k.value, k.subtext || ""]);
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value", "Detail"]],
    body: kpiData,
    theme: "grid",
    headStyles: { fillColor: primaryColor, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  if (recommendation) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("AI Recommendation", 14, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(`Recommended Vendor: ${recommendation.vendorName}`, 14, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const answerLines = doc.splitTextToSize(recommendation.answer, pageWidth - 28);
    doc.text(answerLines, 14, y);
    y += answerLines.length * 4 + 4;

    doc.setFont("helvetica", "bold");
    doc.text("Evidence:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    recommendation.evidence.forEach((e) => {
      const lines = doc.splitTextToSize(`• ${e}`, pageWidth - 32);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(lines, 18, y);
      y += lines.length * 4 + 1;
    });

    y += 3;
    doc.setFont("helvetica", "bold");
    doc.text("Trade-offs:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    recommendation.tradeoffs.forEach((t) => {
      const lines = doc.splitTextToSize(`• ${t}`, pageWidth - 32);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(lines, 18, y);
      y += lines.length * 4 + 1;
    });
  }

  if (summary) {
    y += 8;
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Procurement Summary", 14, y);
    y += 7;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    const overviewLines = doc.splitTextToSize(summary.overview, pageWidth - 28);
    doc.text(overviewLines, 14, y);
    y += overviewLines.length * 4 + 4;

    doc.setFont("helvetica", "bold");
    doc.text("Key Findings:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    summary.keyFindings.forEach((f) => {
      const lines = doc.splitTextToSize(`• ${f}`, pageWidth - 32);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(lines, 18, y);
      y += lines.length * 4 + 1;
    });

    y += 3;
    doc.setFont("helvetica", "bold");
    doc.text("Risks:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    summary.risks.forEach((r) => {
      const lines = doc.splitTextToSize(`• ${r}`, pageWidth - 32);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(lines, 18, y);
      y += lines.length * 4 + 1;
    });
  }

  doc.addPage();
  y = 20;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Vendor Comparison Detail", 14, y);
  y += 7;

  const tableHead = ["Item", ...event.vendors.map((v) => v.name)];
  const tableBody = event.vendors[0].lineItems.map((_, idx) => {
    const item = event.vendors[0].lineItems[idx];
    return [
      `${item.itemId}\n${item.itemName}`,
      ...event.vendors.map((v) => {
        const li = v.lineItems[idx];
        return `${formatCurrency(li.unitPrice)}/unit\nLead: ${li.leadTimeDays}d\n${li.technicalCompliance ? "Compliant" : "Non-compliant"}\nRisk: ${li.riskLevel}`;
      }),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [tableHead],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: primaryColor, fontSize: 6, cellPadding: 2 },
    bodyStyles: { fontSize: 6, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 30 } },
    margin: { left: 8, right: 8 },
    styles: { overflow: "linebreak" },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `ProcureIQ Report — ${event.name} — Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`ProcureIQ_${event.name.replace(/\s+/g, "_")}_Report.pdf`);
}
