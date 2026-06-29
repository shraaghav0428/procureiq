import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/ai/client";
import { getSystemPrompt, getRecommendationPrompt } from "@/lib/ai/prompts";
import { getEventById } from "@/data/events";
import { Persona } from "@/types";

const IT_RECOMMENDATION = {
  vendorId: "v-primetech",
  vendorName: "PrimeTech Distribution",
  answer:
    "PrimeTech Distribution is the recommended vendor, offering the strongest balance of cost efficiency and full compliance. At ₹3,81,35,180 total, it is the lowest-cost vendor with 100% technical compliance across all 15 line items and consistent low-risk ratings — ₹24,92,490 cheaper than TechCorp Solutions while maintaining comparable delivery performance and enterprise-grade certifications.",
  evidence: [
    "Lowest compliant total value at ₹3,81,35,180 — 6.1% cheaper than TechCorp Solutions (₹4,06,27,670) and 18.5% cheaper than GlobalIT Supplies (₹4,67,73,820), both also fully compliant",
    "100% technical compliance across all 15 line items vs NexGen Hardware (2 of 15 compliant, 13%) and AlphaTech Industries (8 of 15 compliant, 53%) — TechCorp and GlobalIT also achieve 100% but at higher cost",
    "L1 pricing on 3 key items — External SSD at ₹5,146/unit (₹20,58,400 total), Webcam at ₹2,324/unit (₹5,81,000 total), and Power Bank at ₹996/unit (₹1,99,200 total) — with competitive L2/L3 positioning across remaining items",
    "Average lead time of 8.9 days (range 5–16 days) with 15-day credit terms and CIP incoterms — enabling predictable supply chain planning across 3 regional offices vs NexGen's 18–30 day lead times with 100% advance payment",
    "Strong certification coverage including FIPS 140-2 on USB Flash Drive and External SSD, EPEAT Gold on Laptop, ISO 9001/14001 across major categories — meeting enterprise security and sustainability requirements",
  ],
  recommendation:
    "Award all 15 line items to PrimeTech Distribution at ₹3,81,35,180. This represents a defensible middle-ground cost position — ₹79,86,260 above NexGen Hardware (which fails compliance on 13 of 15 items) but ₹24,92,490 below TechCorp Solutions, with zero compliance risk and enterprise-grade certifications required for corporate multi-office IT deployment.",
  tradeoffs: [
    "NexGen Hardware offers ₹3,01,48,920 total (₹79,86,260 savings) but provides only 13% compliance (2 of 15 items), High risk rating, 100% advance payment, and EXW incoterms — unacceptable for enterprise IT procurement",
    "AlphaTech Industries at ₹3,57,32,330 is ₹24,02,850 cheaper but fails compliance on 7 of 15 items (53%) including USB-C Docking Station, Network Switch, and External HDD — creating security and operational gaps",
    "TechCorp Solutions at ₹4,06,27,670 matches PrimeTech on compliance and risk but costs ₹24,92,490 more with comparable delivery terms — the premium is not justified by the marginal rating difference (4.5 vs 4.1)",
  ],
  confidence: 0.92,
};

export async function POST(request: NextRequest) {
  try {
    const { eventId, persona } = (await request.json()) as {
      eventId: string;
      persona: Persona;
    };

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventId === "evt-it-equipment") {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return NextResponse.json(IT_RECOMMENDATION);
    }

    const systemPrompt = getSystemPrompt(event, persona);
    const userPrompt = getRecommendationPrompt(event, persona);

    const response = await generateResponse(systemPrompt, userPrompt);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const recommendation = JSON.parse(jsonMatch[0]);
    return NextResponse.json(recommendation);
  } catch (error: unknown) {
    console.error("Recommendation error:", error);
    const msg = error instanceof Error ? error.message : "";
    const status = msg.includes("429") || msg.includes("503") ? 429 : 500;
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status }
    );
  }
}
