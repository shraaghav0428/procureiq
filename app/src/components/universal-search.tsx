"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import { suggestedQuestions } from "@/data/suggested-questions";
import { ChatMessage } from "@/components/right-panel/chat-message";
import { ChatMessage as ChatMessageType } from "@/types";
import {
  Search,
  Loader2,
  X,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Send,
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

function StaticVendorNav({ onNavigate }: { onNavigate: () => void }) {
  const { selectedEvent, highlightVendor } = useAppStore();
  const vendors = selectedEvent.vendors;

  const vendorTotals = vendors.map((v) => ({
    ...v,
    total: v.lineItems.reduce((sum, item) => sum + item.annualQty * item.unitPrice, 0),
  }));
  vendorTotals.sort((a, b) => a.total - b.total);

  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-2 px-3 border-t border-border/50">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mr-1 shrink-0 whitespace-nowrap">
        Navigate:
      </span>
      {vendorTotals.map((v) => (
        <button
          key={v.id}
          onClick={() => {
            onNavigate();
            setTimeout(() => {
              highlightVendor(v.id);
              const el = document.querySelector(`[data-vendor-id="${v.id}"]`);
              el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }, 150);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0070BB] bg-[#0070BB]/5 border border-[#0070BB]/20 rounded px-1.5 py-0.5 hover:bg-[#0070BB]/10 transition-colors cursor-pointer"
        >
          {v.name}
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      ))}
    </div>
  );
}

export function UniversalSearch() {
  const [input, setInput] = useState("");
  const [bottomInput, setBottomInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const {
    chatMessages,
    selectedEvent,
    persona,
    isLoadingChat,
    addChatMessage,
    setIsLoadingChat,
  } = useAppStore();

  const questions = (suggestedQuestions[selectedEvent.id] || []).filter(
    (q) => q.persona === persona || q.persona === "both"
  );

  const hasMessages = chatMessages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      setShowScrollDown(!isNearBottom && el.scrollHeight > el.clientHeight + 100);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [isExpanded]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const collapseAndNavigate = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoadingChat) return;
    setInput("");
    setBottomInput("");
    setIsExpanded(true);

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
      setTimeout(() => bottomInputRef.current?.focus(), 200);
    }
  }, [selectedEvent.id, persona, isLoadingChat, addChatMessage, setIsLoadingChat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
    if (e.key === "Escape") {
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(bottomInput);
  };

  const handleBottomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(bottomInput);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={panelRef} className="px-4 pt-2 pb-3 relative z-30">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#0070BB]/30 focus-within:border-[#0070BB]/50 transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsExpanded(true)}
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
          {hasMessages && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title={isExpanded ? "Collapse" : "Show chat history"}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Close chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!isExpanded && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 min-w-0">
              <QuickQuestionStrip questions={questions} onAsk={sendMessage} disabled={isLoadingChat} />
            </div>
            {hasMessages && (
              <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-muted-foreground">
                <span className="text-[#0070BB] font-medium">{chatMessages.filter(m => m.role === "user").length} asked</span>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="text-[#0070BB] hover:underline"
                >
                  View
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {isExpanded && (hasMessages || isLoadingChat) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col" style={{ maxHeight: "50vh" }}>
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 relative">
            {chatMessages.map((msg) => (
              <div key={msg.id}>
                <ChatMessage message={msg} />
              </div>
            ))}

            {isLoadingChat &&
              chatMessages[chatMessages.length - 1]?.content === "" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing procurement data...
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollDown && (
            <button
              onClick={scrollToBottom}
              className="absolute right-4 bottom-24 w-7 h-7 rounded-full bg-[#0070BB] text-white shadow-lg flex items-center justify-center hover:bg-[#005a96] transition-colors z-10"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="shrink-0 border-t border-border">
            <StaticVendorNav onNavigate={collapseAndNavigate} />

            <form onSubmit={handleBottomSubmit} className="flex items-center gap-2 px-3 py-2 border-t border-border/50 bg-muted/20">
              <input
                ref={bottomInputRef}
                type="text"
                value={bottomInput}
                onChange={(e) => setBottomInput(e.target.value)}
                onKeyDown={handleBottomKeyDown}
                placeholder="Follow up..."
                disabled={isLoadingChat}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!bottomInput.trim() || isLoadingChat}
                className="shrink-0 w-6 h-6 rounded-md bg-[#0070BB] text-white flex items-center justify-center hover:bg-[#005a96] transition-colors disabled:opacity-30"
              >
                <Send className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  useAppStore.getState().clearChat();
                  setIsExpanded(false);
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground shrink-0"
              >
                Clear
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
