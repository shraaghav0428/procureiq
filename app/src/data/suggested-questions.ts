import { SuggestedQuestion } from "@/types";

export const suggestedQuestions: Record<string, SuggestedQuestion[]> = {
  "evt-it-equipment": [
    {
      id: "q1",
      text: "Which vendor offers the best overall value for laptops?",
      persona: "manager",
      category: "cost",
    },
    {
      id: "q2",
      text: "Which vendors have compliance issues I should be aware of?",
      persona: "manager",
      category: "compliance",
    },
    {
      id: "q3",
      text: "Compare lead times across all vendors for high-priority items.",
      persona: "manager",
      category: "delivery",
    },
    {
      id: "q4",
      text: "Which items from NexGen Hardware carry the highest risk?",
      persona: "manager",
      category: "risk",
    },
    {
      id: "q5",
      text: "What is the total cost difference between TechCorp and PrimeTech?",
      persona: "manager",
      category: "cost",
    },
    {
      id: "q6",
      text: "What is the total procurement spend exposure across all vendors?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "q7",
      text: "Which vendor should we strategically partner with long-term?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "q8",
      text: "What are the top 3 risks in this sourcing event?",
      persona: "head",
      category: "risk",
    },
    {
      id: "q9",
      text: "How do payment terms compare across vendors?",
      persona: "head",
      category: "cost",
    },
    {
      id: "q10",
      text: "Which vendors meet all certification requirements?",
      persona: "both",
      category: "compliance",
    },
  ],
  "evt-industrial-safety": [
    {
      id: "q11",
      text: "Which vendor is best for critical PPE like harnesses and respirators?",
      persona: "manager",
      category: "compliance",
    },
    {
      id: "q12",
      text: "Compare safety certification coverage across vendors.",
      persona: "manager",
      category: "compliance",
    },
    {
      id: "q13",
      text: "Which items from BulkSafety Direct fail technical compliance?",
      persona: "manager",
      category: "risk",
    },
    {
      id: "q14",
      text: "What is the delivery timeline for safety boots across vendors?",
      persona: "manager",
      category: "delivery",
    },
    {
      id: "q15",
      text: "Which vendor offers the best value for fire safety equipment?",
      persona: "manager",
      category: "cost",
    },
    {
      id: "q16",
      text: "What is the total annual safety equipment budget across vendors?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "q17",
      text: "What is our compliance risk if we go with the cheapest vendor?",
      persona: "head",
      category: "risk",
    },
    {
      id: "q18",
      text: "Should we split the order across multiple vendors to reduce risk?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "q19",
      text: "Which vendor has the strongest safety track record?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "q20",
      text: "Are there any items where only one vendor meets compliance?",
      persona: "both",
      category: "compliance",
    },
  ],
};
