"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { Info, X, Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { Vendor } from "@/types";

const INR_RATE = 83;

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount * INR_RATE);
}

function PriceChange({ currentPrice, previousPrice, showPrevious }: { currentPrice: number; previousPrice: number; showPrevious: boolean }) {
  const pctChange = ((currentPrice - previousPrice) / previousPrice) * 100;
  const isCostUp = pctChange > 0;
  const absChange = Math.abs(pctChange);

  if (absChange < 0.5) return null;

  return (
    <span className="inline-flex items-center gap-0.5">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[9px] font-semibold",
          isCostUp ? "text-red-600" : "text-green-600"
        )}
      >
        {isCostUp ? (
          <TrendingDown className="w-2.5 h-2.5" />
        ) : (
          <TrendingUp className="w-2.5 h-2.5" />
        )}
        {absChange.toFixed(2)}%
      </span>
      {showPrevious && (
        <span className="relative ml-0.5 group">
          <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-muted-foreground/20 text-[7px] font-bold text-muted-foreground cursor-help">
            i
          </span>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap bg-foreground text-background text-[10px] px-2 py-1 rounded shadow-lg z-50">
            Previously bought at {formatInr(previousPrice)}
          </span>
        </span>
      )}
    </span>
  );
}

function QuoteDetailOverlay({
  vendor,
  onClose,
}: {
  vendor: Vendor;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-[#0070BB]/10 text-[#0070BB] px-2 py-0.5 rounded">
                {vendor.quoteId}
              </span>
              <h2 className="text-sm font-semibold text-foreground">
                {vendor.name}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {vendor.lineItems.length} line items
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    Item
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    HSN
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    UoM
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    MOQ
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    Qty/Yr
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    Lead Time
                  </th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider">
                    Certifications
                  </th>
                </tr>
              </thead>
              <tbody>
                {vendor.lineItems.map((item, i) => (
                  <tr
                    key={item.itemId}
                    className={i % 2 === 0 ? "bg-card" : "bg-muted/10"}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-foreground">
                        {item.itemName}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.itemId}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {item.hsnCode}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {item.uom}
                    </td>
                    <td className="px-3 py-2 text-right text-foreground">
                      {item.qtyPerBatch.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-right text-foreground">
                      {formatInr(item.unitPrice)}
                    </td>
                    <td className="px-3 py-2 text-right text-foreground">
                      {item.annualQty.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-foreground">
                      {formatInr(item.annualQty * item.unitPrice)}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {item.leadTimeDays}d
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          item.technicalCompliance
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {item.technicalCompliance ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {item.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-0.5">
                          {item.certifications.map((cert) => (
                            <span
                              key={cert}
                              className="text-[8px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Terms & Conditions
            </h3>
            <p className="text-sm text-foreground leading-relaxed bg-muted/20 rounded-lg p-3">
              {vendor.termsAndConditions}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-xs text-[#0070BB] bg-[#0070BB]/5 border border-[#0070BB]/20 rounded-lg px-3 py-2 hover:bg-[#0070BB]/10 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download Quote Attachment
            </button>
            <span className="text-[10px] text-muted-foreground">
              <FileText className="w-3 h-3 inline mr-1" />
              {vendor.lineItems[0]?.quotationAttachment || "Quote.pdf"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparisonTable() {
  const { selectedEvent } = useAppStore();
  const vendors = selectedEvent.vendors;
  const lineItemCount = vendors[0].lineItems.length;
  const [quoteVendor, setQuoteVendor] = useState<Vendor | null>(null);

  const vendorTotals = vendors.map((v) =>
    v.lineItems.reduce((sum, item) => sum + item.annualQty * item.unitPrice, 0)
  );

  const overallRanks = vendorTotals
    .map((total, idx) => ({ total, idx }))
    .sort((a, b) => a.total - b.total)
    .map((item, rank) => ({ ...item, rank: rank + 1 }));

  const vendorOverallRank = new Map(
    overallRanks.map((item) => [item.idx, item.rank])
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Supplier Comparison
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedEvent.name} &middot; {vendors.length} vendors &middot;{" "}
            {lineItemCount} line items
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto max-h-[calc(100vh-220px)]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-20">
              <tr className="bg-muted/90 backdrop-blur-sm">
                <th className="sticky left-0 z-30 bg-muted/90 backdrop-blur-sm text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-r border-border min-w-[240px]">
                  Item
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-r border-border w-[70px] bg-muted/90 backdrop-blur-sm">
                  UoM
                </th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-r border-border w-[80px] bg-muted/90 backdrop-blur-sm">
                  Qty/Yr
                </th>
                {vendors.map((vendor, vIdx) => {
                  const rank = vendorOverallRank.get(vIdx) || 0;
                  return (
                    <th
                      key={vendor.id}
                      className={cn(
                        "text-left px-3 py-2.5 border-b border-border min-w-[200px] bg-muted/90 backdrop-blur-sm",
                        rank === 1 && "bg-green-50/80"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold",
                            rank === 1
                              ? "bg-green-600 text-white"
                              : "bg-[#0070BB]/10 text-[#0070BB]"
                          )}
                        >
                          {vendor.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-foreground block truncate">
                            {vendor.name}
                          </span>
                        </div>
                        {rank === 1 && (
                          <span className="text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">
                            L1
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setQuoteVendor(vendor)}
                        className="text-[10px] font-mono text-[#0070BB] hover:underline cursor-pointer"
                      >
                        {vendor.quoteId}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: lineItemCount }, (_, rowIdx) => {
                const refItem = vendors[0].lineItems[rowIdx];

                const itemTotals = vendors.map(
                  (v) =>
                    v.lineItems[rowIdx].annualQty *
                    v.lineItems[rowIdx].unitPrice
                );
                const ranked = itemTotals
                  .map((total, idx) => ({ total, idx }))
                  .sort((a, b) => a.total - b.total);
                const itemRankMap = new Map(
                  ranked.map((item, rank) => [item.idx, rank + 1])
                );

                return (
                  <tr
                    key={refItem.itemId}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      rowIdx % 2 === 0 ? "bg-card" : "bg-muted/10"
                    )}
                  >
                    <td className="sticky left-0 z-10 px-3 py-2.5 border-r border-border bg-inherit">
                      <div className="text-sm font-medium text-foreground">
                        {refItem.itemName}
                      </div>
                      {refItem.itemDescription && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                          {refItem.itemDescription}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono">
                        {refItem.itemId}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-border text-xs text-muted-foreground">
                      {refItem.uom}
                    </td>
                    <td className="px-3 py-2.5 border-r border-border text-xs text-right text-foreground font-medium">
                      {refItem.annualQty.toLocaleString("en-IN")}
                    </td>
                    {vendors.map((vendor, vIdx) => {
                      const item = vendor.lineItems[rowIdx];
                      const rank = itemRankMap.get(vIdx) || 0;
                      const isL1 = rank === 1;
                      const totalValue = item.annualQty * item.unitPrice;
                      const overallR = vendorOverallRank.get(vIdx) || 0;

                      return (
                        <td
                          key={vendor.id}
                          className={cn(
                            "px-3 py-2.5 border-border",
                            overallR === 1 && "bg-green-50/30"
                          )}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              {formatInr(item.unitPrice)}/{item.uom.toLowerCase()}
                              <PriceChange
                                currentPrice={item.unitPrice}
                                previousPrice={item.previousUnitPrice}
                                showPrevious={isL1}
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "text-sm font-bold",
                                  isL1
                                    ? "text-green-700"
                                    : "text-foreground"
                                )}
                              >
                                {formatInr(totalValue)}
                              </span>
                              <span
                                className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                                  isL1
                                    ? "bg-green-600 text-white"
                                    : rank === 2
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                L{rank}
                              </span>
                            </div>

                            <div className="text-[10px] text-muted-foreground leading-tight">
                              {item.paymentTerms}
                            </div>
                            <div className="text-[10px] text-muted-foreground/70">
                              {item.incoterms}
                            </div>
                            {item.certifications.length > 0 && (
                              <div className="flex flex-wrap gap-0.5 pt-0.5">
                                {item.certifications.map((cert) => (
                                  <span
                                    key={cert}
                                    className="text-[8px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium"
                                  >
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              <tr className="bg-muted/60 border-t-2 border-border font-semibold">
                <td className="sticky left-0 z-10 bg-muted/60 px-3 py-3 border-r border-border">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Total Value
                  </span>
                </td>
                <td className="px-3 py-3 border-r border-border bg-muted/60" />
                <td className="px-3 py-3 border-r border-border bg-muted/60" />
                {vendors.map((vendor, vIdx) => {
                  const total = vendorTotals[vIdx];
                  const rank = vendorOverallRank.get(vIdx) || 0;
                  const isL1 = rank === 1;

                  return (
                    <td
                      key={vendor.id}
                      className={cn(
                        "px-3 py-3 border-border bg-muted/60",
                        isL1 && "bg-green-50/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-base font-bold",
                            isL1 ? "text-green-700" : "text-foreground"
                          )}
                        >
                          {formatInr(total)}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                            isL1
                              ? "bg-green-600 text-white"
                              : rank === 2
                              ? "bg-blue-100 text-blue-700"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          L{rank}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
        <Info className="w-3 h-3" />
        <span>
          All prices in INR (₹), excluding GST. Total Value = Qty/Yr × Unit Price. L1 = Lowest quoted price.
        </span>
      </div>

      {quoteVendor && (
        <QuoteDetailOverlay
          vendor={quoteVendor}
          onClose={() => setQuoteVendor(null)}
        />
      )}
    </div>
  );
}
