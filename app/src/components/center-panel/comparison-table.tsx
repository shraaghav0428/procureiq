"use client";

import { useAppStore } from "@/stores/app-store";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Star,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

function RiskBadge({ level }: { level: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium",
        level === "Low" && "border-green-200 bg-green-50 text-green-700",
        level === "Medium" && "border-amber-200 bg-amber-50 text-amber-700",
        level === "High" && "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {level === "High" && <AlertTriangle className="w-3 h-3 mr-0.5" />}
      {level}
    </Badge>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export function ComparisonTable() {
  const { selectedEvent } = useAppStore();
  const vendors = selectedEvent.vendors;
  const lineItemIds = vendors[0].lineItems.map((item) => item.itemId);

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Supplier Comparison
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedEvent.name} &middot; {vendors.length} vendors &middot;{" "}
              {vendors[0].lineItems.length} line items
            </p>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="sticky left-0 z-10 bg-muted/50 text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-r border-border min-w-[200px]">
                    Item
                  </th>
                  {vendors.map((vendor) => (
                    <th
                      key={vendor.id}
                      className="text-left px-4 py-3 border-b border-border min-w-[260px]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {vendor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {vendor.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <RatingStars
                              rating={vendor.lineItems[0].historicalRating}
                            />
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineItemIds.map((itemId, rowIdx) => (
                  <tr
                    key={itemId}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      rowIdx % 2 === 0 ? "bg-card" : "bg-muted/10"
                    )}
                  >
                    <td className="sticky left-0 z-10 px-4 py-3 border-r border-border font-medium bg-inherit">
                      <div className="text-sm text-foreground">
                        {vendors[0].lineItems[rowIdx].itemName}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {itemId} &middot;{" "}
                        {vendors[0].lineItems[rowIdx].uom} &middot; Qty{" "}
                        {vendors[0].lineItems[rowIdx].qtyPerBatch}
                      </div>
                    </td>
                    {vendors.map((vendor) => {
                      const item = vendor.lineItems[rowIdx];
                      const prices = vendors.map(
                        (v) => v.lineItems[rowIdx].unitPrice
                      );
                      const minPrice = Math.min(...prices);
                      const isLowest = item.unitPrice === minPrice;

                      return (
                        <td
                          key={vendor.id}
                          className="px-4 py-3 border-border"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-semibold",
                                  isLowest
                                    ? "text-green-700"
                                    : "text-foreground"
                                )}
                              >
                                {formatCurrency(item.unitPrice)}
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  /unit
                                </span>
                              </span>
                              {isLowest && (
                                <Badge className="text-[9px] bg-green-100 text-green-700 hover:bg-green-100 px-1.5 py-0">
                                  Lowest
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span>
                                Total: {formatCurrency(item.totalPrice)}
                              </span>
                              <span>&middot;</span>
                              <span>{item.leadTimeDays}d lead</span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {item.technicalCompliance ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Compliant
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-red-600">
                                  <XCircle className="w-3 h-3" />
                                  Non-compliant
                                </span>
                              )}
                              <RiskBadge level={item.riskLevel} />
                            </div>

                            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                              <span>{item.paymentTerms}</span>
                              <span>&middot;</span>
                              <span>{item.incoterms}</span>
                              {item.certifications.length > 0 && (
                                <>
                                  <span>&middot;</span>
                                  <span className="inline-flex items-center gap-0.5">
                                    <ShieldCheck className="w-3 h-3 text-primary" />
                                    {item.certifications.length} cert
                                    {item.certifications.length !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                </>
                              )}
                              {item.certifications.length === 0 && (
                                <>
                                  <span>&middot;</span>
                                  <span className="inline-flex items-center gap-0.5 text-amber-600">
                                    <ShieldAlert className="w-3 h-3" />
                                    No certs
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="text-[10px] text-muted-foreground italic flex items-start gap-1">
                              <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">
                                {item.commercialRemarks}
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
