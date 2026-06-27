export type Persona = "manager" | "head";

export type RiskLevel = "Low" | "Medium" | "High";

export type OrderType = "One-Time" | "Annual Contract" | "Blanket Order";

export interface LineItem {
  itemId: string;
  itemName: string;
  itemDescription: string;
  hsnCode: string;
  gstPercent: number;
  uom: string;
  qtyPerBatch: number;
  annualQty: number;
  orderType: OrderType;
  unitPrice: number;
  totalPrice: number;
  paymentTerms: string;
  incoterms: string;
  leadTimeDays: number;
  commercialRemarks: string;
  quotationAttachment: string;
  technicalCompliance: boolean;
  historicalRating: number;
  riskLevel: RiskLevel;
  certifications: string[];
}

export interface Vendor {
  id: string;
  name: string;
  quoteId: string;
  termsAndConditions: string;
  lineItems: LineItem[];
}

export interface SourcingEvent {
  id: string;
  name: string;
  category: string;
  description: string;
  vendors: Vendor[];
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  persona: Persona | "both";
  category: "cost" | "risk" | "delivery" | "compliance" | "strategy";
}

export interface KPI {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIRecommendation {
  vendorId: string;
  vendorName: string;
  answer: string;
  evidence: string[];
  recommendation: string;
  tradeoffs: string[];
  confidence: number;
}

export interface ProcurementSummary {
  overview: string;
  keyFindings: string[];
  risks: string[];
  recommendation: string;
}
