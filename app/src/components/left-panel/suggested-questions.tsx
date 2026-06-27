"use client";

import { useAppStore } from "@/stores/app-store";
import { suggestedQuestions } from "@/data/suggested-questions";
import { ChatMessage } from "@/types";
import {
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Truck,
  ShieldCheck,
  Target,
} from "lucide-react";

const categoryIcons = {
  cost: DollarSign,
  risk: AlertTriangle,
  delivery: Truck,
  compliance: ShieldCheck,
  strategy: Target,
};

export function SuggestedQuestions() {
  const { selectedEvent, persona, addChatMessage, setIsLoadingChat } =
    useAppStore();

  const questions = (suggestedQuestions[selectedEvent.id] || []).filter(
    (q) => q.persona === persona || q.persona === "both"
  );

  const handleQuestionClick = async (questionText: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: questionText,
      timestamp: new Date(),
    };
    addChatMessage(userMessage);

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    addChatMessage(assistantMessage);
    setIsLoadingChat(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          persona,
          message: questionText,
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        useAppStore.getState().updateLastAssistantMessage(accumulated);
      }
    } catch (error) {
      console.error("Chat error:", error);
      useAppStore
        .getState()
        .updateLastAssistantMessage(
          "Sorry, I encountered an error processing your question. Please try again."
        );
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5" />
        Suggested Questions
      </h3>
      <div className="space-y-1.5">
        {questions.slice(0, 5).map((q) => {
          const Icon = categoryIcons[q.category];
          return (
            <button
              key={q.id}
              onClick={() => handleQuestionClick(q.text)}
              className="w-full text-left p-2.5 rounded-lg border border-border bg-background hover:bg-accent hover:border-primary/20 transition-all duration-200 group"
            >
              <div className="flex gap-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground leading-relaxed">
                  {q.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
