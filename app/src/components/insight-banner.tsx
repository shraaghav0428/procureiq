"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { Lightbulb, AlertTriangle, X, ShieldAlert, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourcingEvent } from "@/types";

const INR_RATE = 83;

function formatLakhs(amount: number): string {
  const inr = amount * INR_RATE;
  if (inr >= 10000000) return `₹${(inr / 10000000).toFixed(1)}Cr`;
  return `₹${(inr / 100000).toFixed(1)}L`;
}

const HIGH_RISK_REASONS = [
  "Vendor has previously defaulted on purchase order commitments",
  "Repeated delivery delays observed in past procurement cycles",
  "History of commercial price revisions after final negotiation",
  "Poor vendor credit rating impacting financial reliability",
];

const MEDIUM_RISK_REASONS = [
  "Mixed historical buyer performance ratings",
  "Limited procurement history with the organization",
  "Minor documentation or compliance gaps observed previously",
  "Occasional delivery delays on non-critical orders",
];

const LOW_RISK_REASONS = [
  "Consistently fulfilled purchase orders on schedule",
  "No history of post-award commercial price revisions",
  "Strong internal vendor performance rating",
  "Long-term preferred supplier with consistent performance",
];

function getRiskReasons(riskLevel: "High" | "Medium" | "Low", seed: number): string[] {
  const pool = riskLevel === "High" ? HIGH_RISK_REASONS : riskLevel === "Medium" ? MEDIUM_RISK_REASONS : LOW_RISK_REASONS;
  const count = riskLevel === "Low" ? 2 : riskLevel === "Medium" ? 2 : 3;
  const start = seed % pool.length;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(start + i) % pool.length]);
  }
  return result;
}

function getVendorRiskLevel(avgRating: number, complianceRate: number): "High" | "Medium" | "Low" {
  if (avgRating < 3.5 && complianceRate < 50) return "High";
  if (avgRating >= 4.5 && complianceRate === 100) return "Low";
  if (avgRating < 3.8 || complianceRate < 70) return "Medium";
  if (avgRating >= 4.0 && complianceRate >= 80) return "Low";
  return "Medium";
}

interface VendorInsight {
  id: string;
  name: string;
  total: number;
  rank: number;
  avgRating: number;
  complianceRate: number;
  nonCompliantCount: number;
  riskLevel: "High" | "Medium" | "Low";
  riskReasons: string[];
  nonCompliantItems: { itemName: string; itemId: string; reason: string }[];
}

function computeInsights(event: SourcingEvent) {
  const vendors = event.vendors;
  const lineItemCount = vendors[0].lineItems.length;

  const insights: VendorInsight[] = vendors.map((v, vIdx) => {
    const total = v.lineItems.reduce((sum, item) => sum + item.annualQty * item.unitPrice, 0);
    const avgRating = v.lineItems.reduce((s, i) => s + i.historicalRating, 0) / v.lineItems.length;
    const compliant = v.lineItems.filter((i) => i.technicalCompliance).length;
    const nonCompliantItems = v.lineItems.filter((i) => !i.technicalCompliance);
    const complianceRate = Math.round((compliant / lineItemCount) * 100);

    const riskLevel = getVendorRiskLevel(avgRating, complianceRate);
    const riskReasons = getRiskReasons(riskLevel, vIdx * 7 + Math.round(avgRating * 10));

    return {
      id: v.id,
      name: v.name,
      total,
      rank: 0,
      avgRating,
      complianceRate,
      nonCompliantCount: nonCompliantItems.length,
      riskLevel,
      riskReasons,
      nonCompliantItems: nonCompliantItems.map((i) => ({
        itemName: i.itemName,
        itemId: i.itemId,
        reason: i.commercialRemarks,
      })),
    };
  });

  insights.sort((a, b) => a.total - b.total);
  insights.forEach((v, i) => (v.rank = i + 1));

  return insights;
}

function computeSavingsVsLastBuy(event: SourcingEvent): { totalSavings: number; itemCount: number; totalItems: number } {
  const vendors = event.vendors;
  const lineItemCount = vendors[0].lineItems.length;

  const vendorTotals = vendors.map((v) => ({
    vendor: v,
    total: v.lineItems.reduce((sum, item) => sum + item.annualQty * item.unitPrice, 0),
  }));
  vendorTotals.sort((a, b) => a.total - b.total);
  const l1Vendor = vendorTotals[0].vendor;

  let totalSavings = 0;
  let itemCount = 0;

  for (const item of l1Vendor.lineItems) {
    const diff = (item.previousUnitPrice - item.unitPrice) * item.annualQty;
    if (diff > 0) {
      totalSavings += diff;
      itemCount++;
    }
  }

  return { totalSavings, itemCount, totalItems: lineItemCount };
}

function formatInrAmount(amount: number): string {
  const inr = amount * INR_RATE;
  if (inr >= 10000000) return `₹${(inr / 10000000).toFixed(1)}Cr`;
  if (inr >= 100000) return `₹${(inr / 100000).toFixed(1)}L`;
  return `₹${Math.round(inr).toLocaleString("en-IN")}`;
}

function generateInsightText(insights: VendorInsight[], event: SourcingEvent): string {
  const l1 = insights[0];
  const l2 = insights[1];
  const savings = computeSavingsVsLastBuy(event);

  const savingsPrefix = savings.totalSavings > 0
    ? `${formatInrAmount(savings.totalSavings)} potential savings vs last buy across ${savings.itemCount} of ${savings.totalItems} items. `
    : "";

  const savingsVsL2 = l2.total - l1.total;
  const savingsPct = ((savingsVsL2 / l2.total) * 100).toFixed(1);

  if (l1.riskLevel === "High" || l1.complianceRate < 60) {
    return `${savingsPrefix}L1 ${l1.name} at ${formatLakhs(l1.total)} is ${l1.riskLevel.toLowerCase()} risk with ${l1.complianceRate}% compliance — review alternatives before awarding. ${savingsPct}% spread vs L2.`;
  }

  if (l1.complianceRate === 100 && l1.riskLevel === "Low") {
    return `${savingsPrefix}L1 ${l1.name} at ${formatLakhs(l1.total)} — fully compliant, low risk. Saves ${formatLakhs(savingsVsL2)} (${savingsPct}%) vs L2 ${l2.name}.`;
  }

  return `${savingsPrefix}L1 ${l1.name} at ${formatLakhs(l1.total)} (${l1.complianceRate}% compliant, ${l1.riskLevel.toLowerCase()} risk). ${savingsPct}% spread vs L2 ${l2.name}. Review compliance and terms before awarding.`;
}

function generatePlainEnglish(insights: VendorInsight[], event: SourcingEvent): { title: string; points: { icon: "savings" | "warning" | "info" | "tip"; text: string }[] } {
  const l1 = insights[0];
  const l2 = insights[1];
  const savings = computeSavingsVsLastBuy(event);
  const savingsVsL2 = l2.total - l1.total;
  const savingsPct = ((savingsVsL2 / l2.total) * 100).toFixed(1);
  const compliantVendors = insights.filter(v => v.complianceRate === 100);
  const points: { icon: "savings" | "warning" | "info" | "tip"; text: string }[] = [];

  if (savings.totalSavings > 0) {
    points.push({
      icon: "savings",
      text: `${l1.name} (the cheapest vendor overall) quotes ${formatInrAmount(savings.totalSavings)} less than what you paid last time — and that saving exists across ${savings.itemCount === savings.totalItems ? "all" : `${savings.itemCount} of`} ${savings.totalItems} items.`,
    });
  }

  points.push({
    icon: "info",
    text: `${l1.name} is ranked L1 (lowest total cost) at ${formatLakhs(l1.total)}, which is ${savingsPct}% cheaper than the next vendor, ${l2.name} at ${formatLakhs(l2.total)}. The ${savingsPct}% spread means ${parseFloat(savingsPct) > 15 ? "there's a significant price gap — negotiate with L2 or consider split-sourcing" : "the pricing is competitive — small price differences, so prioritize compliance and delivery terms"}.`,
  });

  if (compliantVendors.length > 0 && l1.complianceRate < 100) {
    const names = compliantVendors.map(v => `${v.name} (L${v.rank}, ${formatLakhs(v.total)})`).join(", ");
    points.push({
      icon: "tip",
      text: `Fully compliant alternatives: ${names}. These vendors pass all technical requirements but cost more.`,
    });
  }

  if (l1.riskLevel === "High" || l1.complianceRate < 60) {
    points.push({
      icon: "warning",
      text: `However, ${l1.name} is flagged as ${l1.riskLevel.toLowerCase()} risk — only ${l1.complianceRate}% of their items meet technical compliance (${l1.nonCompliantCount} of ${event.vendors[0].lineItems.length} items fail). Awarding to them without review could expose you to quality or delivery issues.`,
    });
  } else if (l1.complianceRate === 100 && l1.riskLevel === "Low") {
    points.push({
      icon: "savings",
      text: `${l1.name} is fully compliant across all items and rated low risk — a strong candidate for full award.`,
    });
  } else {
    points.push({
      icon: "info",
      text: `${l1.name} has ${l1.complianceRate}% compliance and is rated ${l1.riskLevel.toLowerCase()} risk. Review the ${l1.nonCompliantCount} non-compliant items before awarding.`,
    });
  }

  return {
    title: `${event.name} — At a Glance`,
    points,
  };
}

function InsightExplainer({ insights, event, onClose }: { insights: VendorInsight[]; event: SourcingEvent; onClose: () => void }) {
  const { title, points } = generatePlainEnglish(insights, event);
  const iconMap = {
    savings: { icon: "↓", bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
    warning: { icon: "!", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
    info: { icon: "i", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
    tip: { icon: "✓", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gradient-to-r from-[#0070BB]/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0070BB]/10 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-[#0070BB]" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {points.map((point, i) => {
            const style = iconMap[point.icon];
            return (
              <div key={i} className={cn("flex items-start gap-3 px-4 py-3 rounded-lg border", style.bg, style.border)}>
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5", style.bg, style.text, "border", style.border)}>
                  {style.icon}
                </span>
                <p className="text-[13px] text-foreground leading-relaxed">{point.text}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

function VendorDetailPopup({ vendor, onClose }: { vendor: VendorInsight; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              vendor.rank === 1 ? "bg-green-600 text-white" : vendor.rank === 2 ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
            )}>
              L{vendor.rank}
            </span>
            <h3 className="text-sm font-semibold text-foreground">{vendor.name}</h3>
            <span className="text-xs text-muted-foreground">{vendor.avgRating.toFixed(1)}★</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Risk Assessment */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className={cn(
                "w-3.5 h-3.5",
                vendor.riskLevel === "High" ? "text-red-600" : vendor.riskLevel === "Medium" ? "text-amber-600" : "text-green-600"
              )} />
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Risk Assessment</h4>
              <span className={cn(
                "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                vendor.riskLevel === "High" ? "bg-red-100 text-red-700 border border-red-200"
                  : vendor.riskLevel === "Medium" ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-green-100 text-green-700 border border-green-200"
              )}>
                {vendor.riskLevel} Risk
              </span>
            </div>
            <div className="space-y-1.5">
              {vendor.riskReasons.map((reason, i) => (
                <div key={i} className={cn(
                  "px-3 py-2 rounded-lg text-[11px] leading-snug",
                  vendor.riskLevel === "High" ? "bg-red-50 border border-red-100 text-red-800"
                    : vendor.riskLevel === "Medium" ? "bg-amber-50 border border-amber-100 text-amber-800"
                    : "bg-green-50 border border-green-100 text-green-800"
                )}>
                  • {reason}
                </div>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className={cn(
                "w-3.5 h-3.5",
                vendor.complianceRate === 100 ? "text-green-600" : "text-amber-600"
              )} />
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Compliance</h4>
              <span className={cn(
                "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                vendor.complianceRate === 100 ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-amber-100 text-amber-700 border border-amber-200"
              )}>
                {vendor.complianceRate}%
              </span>
            </div>
            {vendor.nonCompliantItems.length > 0 ? (
              <div className="space-y-1.5">
                {vendor.nonCompliantItems.map((item) => (
                  <div key={item.itemId} className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground">{item.itemName}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                        Non-compliant
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{item.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-100 text-[11px] text-green-800">
                All items meet technical compliance requirements
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center px-2 py-2 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-sm font-bold text-foreground">{formatLakhs(vendor.total)}</div>
              <div className="text-[10px] text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center px-2 py-2 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-sm font-bold text-foreground">{vendor.avgRating.toFixed(1)}★</div>
              <div className="text-[10px] text-muted-foreground">Avg Rating</div>
            </div>
            <div className="text-center px-2 py-2 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-sm font-bold text-foreground">{vendor.complianceRate}%</div>
              <div className="text-[10px] text-muted-foreground">Compliance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsightBanner() {
  const { selectedEvent } = useAppStore();
  const insights = computeInsights(selectedEvent);
  const insightText = generateInsightText(insights, selectedEvent);
  const [popupVendor, setPopupVendor] = useState<VendorInsight | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <>
      <div className="ai-glow rounded-t-xl border-b border-[#0070BB]/10 bg-gradient-to-r from-[#0070BB]/5 to-transparent px-4 py-3">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-5 h-5 rounded-md bg-[#0070BB]/10 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3 h-3 text-[#0070BB]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold text-[#0070BB] uppercase tracking-wider">
                AI Insight
              </span>
            </div>
            <p className="text-[13px] text-foreground leading-relaxed">
              {insightText}
              {" "}
              <button
                onClick={() => setShowExplainer(true)}
                className="inline-flex items-center gap-1 text-[11px] text-[#0070BB]/70 hover:text-[#0070BB] transition-colors cursor-pointer align-middle translate-y-[0.5px]"
              >
                <HelpCircle className="w-3 h-3" />
                What does this mean?
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-8 overflow-x-auto pb-0.5">
          {insights.map((v) => (
            <button
              key={v.id}
              onClick={() => setPopupVendor(v)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all hover:shadow-sm cursor-pointer",
                v.rank === 1
                  ? "border-green-300 bg-green-50 hover:bg-green-100"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                    v.rank === 1
                      ? "bg-green-600 text-white"
                      : v.rank === 2
                      ? "bg-blue-100 text-blue-700"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  L{v.rank}
                </span>
                <span className="font-semibold text-foreground">{v.name}</span>
              </div>
              <span className="text-muted-foreground">{formatLakhs(v.total)}</span>
              <span className={cn(
                "text-[9px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
                v.riskLevel === "High" ? "text-red-700 bg-red-50 border border-red-200"
                  : v.riskLevel === "Medium" ? "text-amber-700 bg-amber-50 border border-amber-200"
                  : "text-green-700 bg-green-50 border border-green-200"
              )}>
                <AlertTriangle className="w-2.5 h-2.5" />
                {v.riskLevel} Risk
              </span>
            </button>
          ))}
        </div>
      </div>

      {popupVendor && (
        <VendorDetailPopup
          vendor={popupVendor}
          onClose={() => setPopupVendor(null)}
        />
      )}

      {showExplainer && (
        <InsightExplainer
          insights={insights}
          event={selectedEvent}
          onClose={() => setShowExplainer(false)}
        />
      )}
    </>
  );
}
