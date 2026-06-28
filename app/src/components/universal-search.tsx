"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import { suggestedQuestions } from "@/data/suggested-questions";
import { ChatMessage as ChatMessageType } from "@/types";
import {
  Search,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

function QuickQuestionStrip({ questions, onAsk, disabled }: { questions: { id: string; text: string }[]; onAsk: (text: string) => void; disabled: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll, questions]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-1 mt-1.5">
      <Sparkles className="w-3 h-3 text-[#0070BB]/50 shrink-0" />
      {canScrollLeft && (
        <button type="button" onClick={() => scroll("left")} className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors">
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
      <div ref={scrollRef} className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {questions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => onAsk(q.text)}
            disabled={disabled}
            className="shrink-0 text-[10px] text-muted-foreground bg-muted/50 border border-border/50 rounded-full px-2.5 py-1 hover:bg-[#0070BB] hover:text-white hover:border-[#0070BB] transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {q.text}
          </button>
        ))}
      </div>
      {canScrollRight && (
        <button type="button" onClick={() => scroll("right")} className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors">
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

export function UniversalSearch() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    chatMessages,
    selectedEvent,
    persona,
    isLoadingChat,
    isChatPanelOpen,
    addChatMessage,
    setIsLoadingChat,
    setChatPanelOpen,
  } = useAppStore();

  const questions = (suggestedQuestions[selectedEvent.id] || []).filter(
    (q) => q.persona === persona || q.persona === "both"
  );

  const hasMessages = chatMessages.length > 0;

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoadingChat) return;
      setInput("");
      setChatPanelOpen(true);

      const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      addChatMessage(userMessage);

      const assistantMessage: ChatMessageType = {
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
            message: text.trim(),
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
      } catch {
        useAppStore
          .getState()
          .updateLastAssistantMessage(
            "Sorry, I encountered an error. Please try again."
          );
      } finally {
        setIsLoadingChat(false);
      }
    },
    [selectedEvent.id, persona, isLoadingChat, addChatMessage, setIsLoadingChat, setChatPanelOpen]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="px-4 pt-2 pb-3 relative z-30">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#0070BB]/30 focus-within:border-[#0070BB]/50 transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI about vendors, pricing, risks, compliance..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {isLoadingChat && (
            <Loader2 className="w-4 h-4 text-[#0070BB] animate-spin shrink-0" />
          )}
          {input.trim() && !isLoadingChat && (
            <button
              type="submit"
              className="text-[11px] font-medium text-white bg-[#0070BB] hover:bg-[#005a96] px-2.5 py-1 rounded transition-colors shrink-0"
            >
              Ask AI
            </button>
          )}
          {hasMessages && !isChatPanelOpen && (
            <button
              type="button"
              onClick={() => setChatPanelOpen(true)}
              className="flex items-center gap-1 text-[10px] text-[#0070BB] font-medium hover:bg-[#0070BB]/5 px-2 py-1 rounded transition-colors shrink-0"
            >
              <MessageSquare className="w-3 h-3" />
              {chatMessages.filter((m) => m.role === "user").length} asked
            </button>
          )}
        </div>

        {!isChatPanelOpen && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 min-w-0">
              <QuickQuestionStrip questions={questions} onAsk={sendMessage} disabled={isLoadingChat} />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
