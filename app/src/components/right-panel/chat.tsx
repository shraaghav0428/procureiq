"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { ChatMessage as ChatMessageType } from "@/types";
import { ChatMessage } from "./chat-message";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageSquare } from "lucide-react";

export function Chat() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    chatMessages,
    selectedEvent,
    persona,
    isLoadingChat,
    addChatMessage,
    updateLastAssistantMessage,
    setIsLoadingChat,
  } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoadingChat) return;

    setInput("");

    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
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
          message: trimmed,
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
        updateLastAssistantMessage(accumulated);
      }
    } catch (error) {
      console.error("Chat error:", error);
      updateLastAssistantMessage(
        "Sorry, I encountered an error. Please try again."
      );
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border flex flex-col">
      {chatMessages.length > 0 && (
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin p-4 space-y-3">
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
      )}

      {chatMessages.length === 0 && (
        <div className="p-4 flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="w-3.5 h-3.5" />
          Ask questions about this sourcing event
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-border flex gap-2"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about vendors, pricing, risks..."
          className="min-h-[40px] max-h-[100px] resize-none text-sm"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoadingChat}
          className="shrink-0 h-10 w-10"
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
