"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { Lightbulb, AlertTriangle, X, ShieldAlert, ShieldCheck } from "lucide-react";
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

function generateInsightText(insights: VendorInsight[]): string {
  const l1 = insights[0];
  const bestRated = [...insights].sort((a, b) => b.avgRating - a.avgRating)[0];
  const l2 = insights[1];

  const savingsVsL2 = l2.total - l1.total;
  const savingsPct = ((savingsVsL2 / l2.total) * 100).toFixed(1);

  if (l1.id === bestRated.id && l1.complianceRate === 100 && l1.riskLevel === "Low") {
    return `${l1.name} is the clear winner — lowest cost at ${formatLakhs(l1.total)}, highest rating (${l1.avgRating.toFixed(1)}★), 100% compliance, and low risk. ${savingsPct}% savings vs L2 ${l2.name}.`;
  }

  if (l1.riskLevel === "High" || l1.complianceRate < 60) {
    return `${l1.name} is L1 at ${formatLakhs(l1.total)} but flagged ${l1.riskLevel.toLowerCase()} risk with ${l1.complianceRate}% compliance. ${bestRated.name} costs ${((bestRated.total - l1.total) / l1.total * 100).toFixed(0)}% more but offers ${bestRated.avgRating.toFixed(1)}★ rating${bestRated.riskLevel === "Low" ? " and low risk" : ""}. Weigh cost savings (${savingsPct}%) against vendor reliability.`;
  }

  if (l1.id !== bestRated.id) {
    return `${l1.name} is L1 at ${formatLakhs(l1.total)} (${l1.avgRating.toFixed(1)}★, ${l1.riskLevel.toLowerCase()} risk). ${bestRated.name} costs ${((bestRated.total - l1.total) / l1.total * 100).toFixed(0)}% more but offers ${bestRated.avgRating.toFixed(1)}★ rating${bestRated.complianceRate === 100 ? " with full compliance" : ""}. Weigh cost savings (${savingsPct}%) against quality.`;
  }

  return `${l1.name} leads at ${formatLakhs(l1.total)} with ${l1.avgRating.toFixed(1)}★ rating and ${l1.riskLevel.toLowerCase()} risk. ${savingsPct}% savings vs next-best ${l2.name}. Review compliance and delivery terms before awarding.`;
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
  const insightText = generateInsightText(insights);
  const [popupVendor, setPopupVendor] = useState<VendorInsight | null>(null);

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
    </>
  );
}
