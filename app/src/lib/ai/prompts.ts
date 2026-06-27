import { Persona, SourcingEvent } from "@/types";

function serializeEventData(event: SourcingEvent): string {
  return event.vendors
    .map((vendor) => {
      const items = vendor.lineItems
        .map(
          (item) =>
            `  - ${item.itemId} ${item.itemName}: $${item.unitPrice}/unit, Total $${item.totalPrice}, ` +
            `Lead ${item.leadTimeDays}d, ${item.paymentTerms}, ${item.incoterms}, ` +
            `Compliance: ${item.technicalCompliance ? "Yes" : "No"}, ` +
            `Rating: ${item.historicalRating}/5, Risk: ${item.riskLevel}, ` +
            `Certs: ${item.certifications.length > 0 ? item.certifications.join(", ") : "None"}, ` +
            `Remarks: ${item.commercialRemarks}`
        )
        .join("\n");
      return `Vendor: ${vendor.name} (${vendor.id})\n${items}`;
    })
    .join("\n\n");
}

export function getSystemPrompt(
  event: SourcingEvent,
  persona: Persona
): string {
  const roleContext =
    persona === "manager"
      ? "You are advising a Procurement Manager who makes operational purchasing decisions. Focus on item-level details, delivery timelines, compliance issues, and practical vendor comparisons."
      : "You are advising a Head of Procurement who makes strategic decisions. Focus on total cost of ownership, risk exposure, vendor reliability, long-term partnerships, and executive-level insights.";

  return `You are ProcureIQ, an AI Procurement Analyst. You help procurement teams evaluate supplier quotations with evidence-backed analysis.

${roleContext}

SOURCING EVENT: ${event.name}
CATEGORY: ${event.category}
DESCRIPTION: ${event.description}

VENDOR DATA:
${serializeEventData(event)}

RULES:
- Only answer using the data provided above. Never make up information.
- If information is not available in the dataset, say so explicitly.
- Cite specific data points (prices, lead times, ratings) in your answers.
- Be concise and actionable. Procurement professionals value clarity over verbosity.
- When comparing vendors, use concrete numbers, not vague language.
- Flag risks proactively when they affect the question being asked.`;
}

export function getRecommendationPrompt(
  event: SourcingEvent,
  persona: Persona
): string {
  const focus =
    persona === "manager"
      ? "Focus on practical factors: pricing competitiveness, lead times, technical compliance, and delivery reliability."
      : "Focus on strategic factors: total cost of ownership, risk mitigation, vendor reliability scores, certification coverage, and long-term partnership potential.";

  return `Analyze all vendors for the "${event.name}" sourcing event and recommend the best vendor.

${focus}

Respond in this exact JSON format:
{
  "vendorId": "the vendor id",
  "vendorName": "the vendor name",
  "answer": "A 2-3 sentence summary of why this vendor is recommended",
  "evidence": ["evidence point 1 with specific data", "evidence point 2", "evidence point 3", "evidence point 4"],
  "recommendation": "A clear 1-2 sentence actionable recommendation",
  "tradeoffs": ["tradeoff 1", "tradeoff 2", "tradeoff 3"],
  "confidence": 0.85
}

Only output valid JSON, nothing else.`;
}

export function getSummaryPrompt(
  event: SourcingEvent,
  persona: Persona
): string {
  const focus =
    persona === "manager"
      ? "Write an operational procurement summary covering vendor comparisons, compliance gaps, delivery risks, and recommended actions."
      : "Write an executive procurement summary covering total spend analysis, strategic vendor assessment, risk overview, and recommended sourcing strategy.";

  return `Generate a procurement summary for the "${event.name}" sourcing event.

${focus}

Respond in this exact JSON format:
{
  "overview": "A 3-4 sentence overview of the sourcing event analysis",
  "keyFindings": ["finding 1 with data", "finding 2 with data", "finding 3 with data", "finding 4 with data"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "recommendation": "A 2-3 sentence strategic recommendation"
}

Only output valid JSON, nothing else.`;
}
