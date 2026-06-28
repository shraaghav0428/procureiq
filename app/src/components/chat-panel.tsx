"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import { suggestedQuestions } from "@/data/suggested-questions";
import { ChatMessage as ChatMessageType } from "@/types";
import { ChatMessage } from "@/components/right-panel/chat-message";
import {
  Send,
  Loader2,
  X,
  BrainCircuit,
  Sparkles,
  ArrowDown,
  ArrowRight,
  Filter,
  Trash2,
} from "lucide-react";

function ActionChips({ content }: { content: string }) {
  const {
    selectedEvent,
    highlightVendor,
    setFilterNonCompliant,
    setFilterSavings,
    setFilterPriceRose,
    filterNonCompliant,
    filterSavings,
    filterPriceRose,
  } = useAppStore();

  const vendors = selectedEvent.vendors;
  const contentLower = content.toLowerCase();

  const mentionedVendors = vendors.filter((v) =>
    contentLower.includes(v.name.toLowerCase())
  );

  const hasCompliance =
    contentLower.includes("compliance") ||
    contentLower.includes("non-compliant") ||
    contentLower.includes("noncompliant");
  const hasSavings =
    contentLower.includes("saving") ||
    contentLower.includes("price drop") ||
    contentLower.includes("cost reduction") ||
    contentLower.includes("cheaper");
  const hasPriceRose =
    contentLower.includes("price rose") ||
    contentLower.includes("price increase") ||
    contentLower.includes("costlier") ||
    contentLower.includes("more expensive");

  const chips: { label: string; icon: "vendor" | "filter"; action: () => void }[] = [];

  mentionedVendors.forEach((v) => {
    chips.push({
      label: v.name,
      icon: "vendor",
      action: () => {
        highlightVendor(v.id);
        const el = document.querySelector(`[data-vendor-id="${v.id}"]`);
        el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      },
    });
  });

  if (hasCompliance) {
    chips.push({
      label: "Non-compliant vendors",
      icon: "filter",
      action: () => setFilterNonCompliant(!filterNonCompliant),
    });
  }
  if (hasSavings) {
    chips.push({
      label: "Highlight savings",
      icon: "filter",
      action: () => setFilterSavings(!filterSavings),
    });
  }
  if (hasPriceRose) {
    chips.push({
      label: "Highlight price rose",
      icon: "filter",
      action: () => setFilterPriceRose(!filterPriceRose),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-2 ml-8">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.action}
          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border transition-all cursor-pointer hover:shadow-sm bg-[#0070BB]/5 text-[#0070BB] border-[#0070BB]/20 hover:bg-[#0070BB]/10"
        >
          {chip.icon === "vendor" ? (
            <ArrowRight className="w-2.5 h-2.5" />
          ) : (
            <Filter className="w-2.5 h-2.5" />
          )}
          {chip.label}
        </button>
      ))}
    </div>
  );
}

export function ChatPanel() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const {
    chatMessages,
    selectedEvent,
    persona,
    isLoadingChat,
    addChatMessage,
    setIsLoadingChat,
    setChatPanelOpen,
    clearChat,
  } = useAppStore();

  const questions = (suggestedQuestions[selectedEvent.id] || []).filter(
    (q) => q.persona === persona || q.persona === "both"
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      setShowScrollDown(!isNearBottom && el.scrollHeight > el.clientHeight + 100);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoadingChat) return;
      setInput("");

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
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [selectedEvent.id, persona, isLoadingChat, addChatMessage, setIsLoadingChat]
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
    if (e.key === "Escape") {
      setChatPanelOpen(false);
    }
  };

  const hasMessages = chatMessages.length > 0;

  return (
    <aside className="w-[400px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-[#0070BB]/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0070BB] flex items-center justify-center">
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">AI Analyst</span>
            <span className="text-[10px] text-muted-foreground ml-2">
              {chatMessages.filter((m) => m.role === "user").length} questions
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasMessages && (
            <button
              onClick={() => clearChat()}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setChatPanelOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-[#0070BB]/10 flex items-center justify-center mb-3">
              <BrainCircuit className="w-6 h-6 text-[#0070BB]" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Ask about this sourcing event
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Compare vendors, analyze pricing, check compliance
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {questions.slice(0, 4).map((q) => (
                <button
                  key={q.id}
                  onClick={() => sendMessage(q.text)}
                  disabled={isLoadingChat}
                  className="text-[11px] text-muted-foreground bg-muted/50 border border-border/50 rounded-full px-3 py-1.5 hover:bg-[#0070BB] hover:text-white hover:border-[#0070BB] transition-all disabled:opacity-50"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id}>
            <ChatMessage message={msg} />
            {msg.role === "assistant" && msg.content && (
              <ActionChips content={msg.content} />
            )}
          </div>
        ))}

        {isLoadingChat && chatMessages[chatMessages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 ml-8">
            <Loader2 className="w-3 h-3 animate-spin" />
            Analyzing procurement data...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollDown && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute right-8 bottom-20 w-7 h-7 rounded-full bg-[#0070BB] text-white shadow-lg flex items-center justify-center hover:bg-[#005a96] transition-colors z-10"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Suggested questions strip (when chat has messages) */}
      {hasMessages && (
        <div className="shrink-0 px-3 py-2 border-t border-border/50 bg-muted/20">
          <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <Sparkles className="w-3 h-3 text-[#0070BB]/50 shrink-0" />
            {questions.slice(0, 3).map((q) => (
              <button
                key={q.id}
                onClick={() => sendMessage(q.text)}
                disabled={isLoadingChat}
                className="shrink-0 text-[10px] text-muted-foreground bg-background border border-border/50 rounded-full px-2.5 py-1 hover:bg-[#0070BB] hover:text-white hover:border-[#0070BB] transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 p-3 border-t border-border flex items-center gap-2 bg-card">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about vendors, pricing, risks..."
          disabled={isLoadingChat}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoadingChat}
          className="shrink-0 w-8 h-8 rounded-lg bg-[#0070BB] text-white flex items-center justify-center hover:bg-[#005a96] transition-colors disabled:opacity-30"
        >
          {isLoadingChat ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </aside>
  );
}
