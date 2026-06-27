"use client";

import { ChatMessage as ChatMessageType } from "@/types";
import { cn } from "@/lib/utils";
import { BrainCircuit, User } from "lucide-react";

function inlineBold(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const headingMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      elements.push(
        <p key={i} className="font-semibold mt-2 first:mt-0">
          {headingMatch[1]}
        </p>
      );
      continue;
    }

    const bulletMatch = line.match(/^\s*[\*\-]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <li key={i} className="ml-3 list-disc text-xs">
          {inlineBold(bulletMatch[1])}
        </li>
      );
      continue;
    }

    if (line.trim() === "") {
      elements.push(<br key={i} />);
    } else {
      elements.push(<p key={i}>{inlineBold(line)}</p>);
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex gap-2.5", isAssistant ? "items-start" : "items-start")}>
      <div
        className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5",
          isAssistant
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isAssistant ? (
          <BrainCircuit className="w-3.5 h-3.5" />
        ) : (
          <User className="w-3.5 h-3.5" />
        )}
      </div>
      <div
        className={cn(
          "text-sm leading-relaxed flex-1 min-w-0",
          isAssistant ? "text-foreground" : "text-foreground font-medium"
        )}
      >
        {isAssistant ? (
          renderMarkdown(message.content)
        ) : (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        )}
      </div>
    </div>
  );
}
