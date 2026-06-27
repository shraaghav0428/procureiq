"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { suggestedQuestions } from "@/data/suggested-questions";
import { ChatMessage as ChatMessageType } from "@/types";
import { ChatMessage } from "@/components/right-panel/chat-message";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  MessageSquare,
  X,
  BrainCircuit,
} from "lucide-react";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chatMessages,
    selectedEvent,
    persona,
    isLoadingChat,
    addChatMessage,
    updateLastAssistantMessage,
    setIsLoadingChat,
  } = useAppStore();

  const questions = (suggestedQuestions[selectedEvent.id] || []).filter(
    (q) => q.persona === persona || q.persona === "both"
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async (text: string) => {
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
    } catch (error) {
      console.error("Chat error:", error);
      useAppStore
        .getState()
        .updateLastAssistantMessage(
          "Sorry, I encountered an error. Please try again."
        );
    } finally {
      setIsLoadingChat(false);
    }
  };

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0070BB] text-white shadow-lg hover:bg-[#005a96] transition-all flex items-center justify-center hover:scale-105"
      >
        <BrainCircuit className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[560px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-border bg-[#0070BB] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          <span className="text-sm font-semibold">AI Procurement Analyst</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {chatMessages.length === 0 && (
        <div className="shrink-0 px-3 py-2.5 border-b border-border bg-muted/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
            Quick Questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {questions.slice(0, 5).map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  sendMessage(q.text);
                }}
                className="text-[11px] text-muted-foreground bg-background border border-border rounded-full px-2.5 py-1 hover:bg-[#0070BB] hover:text-white hover:border-[#0070BB] transition-all"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Ask about vendors, pricing, or risks
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              or pick a quick question above
            </p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoadingChat &&
          chatMessages[chatMessages.length - 1]?.content === "" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyzing procurement data...
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 p-3 border-t border-border flex gap-2 bg-card"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about vendors, pricing, risks..."
          className="min-h-[38px] max-h-[80px] resize-none text-sm"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoadingChat}
          className="shrink-0 h-9 w-9 bg-[#0070BB] hover:bg-[#005a96]"
        >
          {isLoadingChat ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
