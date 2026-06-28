import { SuggestedQuestion } from "@/types";

export const suggestedQuestions: Record<string, SuggestedQuestion[]> = {
  "evt-it-equipment": [
    {
      id: "it-1",
      text: "Which line items should I split across vendors instead of single-sourcing?",
      persona: "both",
      category: "strategy",
    },
    {
      id: "it-2",
      text: "If I award all line items to the L1 vendor, what risks should I consider?",
      persona: "both",
      category: "risk",
    },
    {
      id: "it-3",
      text: "Where can I negotiate further to reduce procurement cost?",
      persona: "both",
      category: "cost",
    },
    {
      id: "it-4",
      text: "Which vendor provides the best balance between cost and lead time?",
      persona: "both",
      category: "delivery",
    },
    {
      id: "it-5",
      text: "📊 Compare total procurement cost across all vendors",
      persona: "both",
      category: "cost",
    },
  ],
  "evt-industrial-safety": [
    {
      id: "sf-1",
      text: "Which vendor has the strongest compliance and certification record?",
      persona: "both",
      category: "compliance",
    },
    {
      id: "sf-2",
      text: "Which suppliers have compliance or certification gaps that require attention?",
      persona: "both",
      category: "compliance",
    },
    {
      id: "sf-3",
      text: "Which safety equipment items carry the highest sourcing risk?",
      persona: "both",
      category: "risk",
    },
    {
      id: "sf-4",
      text: "If I prioritize compliance over lowest price, which vendor should I award?",
      persona: "both",
      category: "strategy",
    },
    {
      id: "sf-5",
      text: "📊 Compare vendor compliance vs total procurement cost",
      persona: "both",
      category: "cost",
    },
  ],
};
