import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SourcingEvent, KPI } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INR_RATE = 83;

export function computeKPIs(event: SourcingEvent): KPI[] {
  const vendors = event.vendors;
  const vendorCount = vendors.length;

  const allTotalPrices = vendors.map((v) =>
    v.lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
  );
  const lowestTotal = Math.min(...allTotalPrices) * INR_RATE;
  const highestTotal = Math.max(...allTotalPrices) * INR_RATE;

  const allLeadTimes = vendors.flatMap((v) =>
    v.lineItems.map((item) => item.leadTimeDays)
  );
  const avgLeadTime = Math.round(
    allLeadTimes.reduce((a, b) => a + b, 0) / allLeadTimes.length
  );

  const totalItems = vendors[0].lineItems.length * vendorCount;
  const compliantItems = vendors
    .flatMap((v) => v.lineItems)
    .filter((item) => item.technicalCompliance).length;
  const complianceRate = Math.round((compliantItems / totalItems) * 100);

  return [
    {
      label: "Vendors Evaluated",
      value: vendorCount.toString(),
      subtext: `${event.vendors[0].lineItems.length} line items each`,
    },
    {
      label: "Quote Range",
      value: `₹${(lowestTotal / 100000).toFixed(1)}L – ₹${(highestTotal / 100000).toFixed(1)}L`,
      subtext: `₹${((highestTotal - lowestTotal) / 100000).toFixed(1)}L spread`,
      trend: "neutral",
    },
    {
      label: "Avg Lead Time",
      value: `${avgLeadTime} days`,
      subtext: `${Math.min(...allLeadTimes)}–${Math.max(...allLeadTimes)} day range`,
    },
    {
      label: "Compliance Rate",
      value: `${complianceRate}%`,
      subtext: `${compliantItems}/${totalItems} items compliant`,
      trend:
        complianceRate >= 80 ? "up" : complianceRate >= 60 ? "neutral" : "down",
    },
  ];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount * INR_RATE);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}
