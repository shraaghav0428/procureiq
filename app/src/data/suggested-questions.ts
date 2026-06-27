import { SuggestedQuestion } from "@/types";

export const suggestedQuestions: Record<string, SuggestedQuestion[]> = {
  "evt-it-equipment": [
    // Purchase Manager
    {
      id: "it-m1",
      text: "Which vendor offers the best value for laptops?",
      persona: "manager",
      category: "cost",
    },
    {
      id: "it-m2",
      text: "How much am I saving if I go with L1 for all line items?",
      persona: "manager",
      category: "cost",
    },
    {
      id: "it-m3",
      text: "Compare lead times across all vendors for all line items.",
      persona: "manager",
      category: "delivery",
    },
    {
      id: "it-m4",
      text: "Which items have compliance issues?",
      persona: "manager",
      category: "compliance",
    },
    {
      id: "it-m5",
      text: "Show the highest priced items.",
      persona: "manager",
      category: "cost",
    },
    {
      id: "it-m6",
      text: "Compare payment terms across suppliers.",
      persona: "manager",
      category: "cost",
    },
    {
      id: "it-m7",
      text: "Which items have the biggest price spread?",
      persona: "manager",
      category: "cost",
    },
    {
      id: "it-m8",
      text: "Which vendors have the most ISO certifications?",
      persona: "manager",
      category: "compliance",
    },
    // Head of Procurement
    {
      id: "it-h1",
      text: "What is the total procurement spend exposure across all vendors?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "it-h2",
      text: "Which vendor should we strategically partner with long-term?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "it-h3",
      text: "What are the top 3 risks in this sourcing event?",
      persona: "head",
      category: "risk",
    },
    {
      id: "it-h4",
      text: "How do payment terms compare across vendors?",
      persona: "head",
      category: "cost",
    },
    {
      id: "it-h5",
      text: "Which vendors meet all certification requirements?",
      persona: "head",
      category: "compliance",
    },
  ],
  "evt-industrial-safety": [
    // Purchase Manager
    {
      id: "sf-m1",
      text: "Which vendor is best for critical PPE like harnesses and respirators?",
      persona: "manager",
      category: "compliance",
    },
    {
      id: "sf-m2",
      text: "Compare safety certification coverage across vendors.",
      persona: "manager",
      category: "compliance",
    },
    {
      id: "sf-m3",
      text: "Which items from BulkSafety Direct fail technical compliance?",
      persona: "manager",
      category: "risk",
    },
    {
      id: "sf-m4",
      text: "What is the delivery timeline for safety boots across vendors?",
      persona: "manager",
      category: "delivery",
    },
    {
      id: "sf-m5",
      text: "Which vendor offers the best value for fire safety equipment?",
      persona: "manager",
      category: "cost",
    },
    // Head of Procurement
    {
      id: "sf-h1",
      text: "What is the total annual safety equipment budget across vendors?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "sf-h2",
      text: "What is our compliance risk if we go with the cheapest vendor?",
      persona: "head",
      category: "risk",
    },
    {
      id: "sf-h3",
      text: "Should we split the order across multiple vendors to reduce risk?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "sf-h4",
      text: "Which vendor has the strongest safety track record?",
      persona: "head",
      category: "strategy",
    },
    {
      id: "sf-h5",
      text: "Are there any items where only one vendor meets compliance?",
      persona: "head",
      category: "compliance",
    },
  ],
};
