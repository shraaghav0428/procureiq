"use client";

import { ChatMessage as ChatMessageType } from "@/types";
import { cn } from "@/lib/utils";
import { BrainCircuit, User } from "lucide-react";

interface ChartDataset {
  label: string;
  data: number[];
}

interface ChartData {
  type: "bar" | "horizontal_bar";
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

const CHART_COLORS = [
  "#0070BB",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function BarChart({ data }: { data: ChartData }) {
  const allValues = data.datasets.flatMap((ds) => ds.data);
  const maxValue = Math.max(...allValues, 1);
  const isHorizontal = data.type === "horizontal_bar";
  const hasMultipleSeries = data.datasets.length > 1;

  if (isHorizontal) {
    return (
      <div className="my-2 p-3 bg-muted/30 rounded-lg border border-border">
        <p className="text-[11px] font-semibold text-foreground mb-2">{data.title}</p>
        <div className="space-y-1.5">
          {data.labels.map((label, i) => (
            <div key={i}>
              {data.datasets.map((ds, dsIdx) => (
                <div key={dsIdx} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-[80px] truncate shrink-0 text-right">
                    {hasMultipleSeries ? `${label} (${ds.label})` : label}
                  </span>
                  <div className="flex-1 h-4 bg-muted/50 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${(ds.data[i] / maxValue) * 100}%`,
                        backgroundColor: CHART_COLORS[dsIdx % CHART_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-[60px] shrink-0">
                    {formatINR(ds.data[i])}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {hasMultipleSeries && (
          <div className="flex gap-3 mt-2">
            {data.datasets.map((ds, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-[9px] text-muted-foreground">{ds.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="my-2 p-3 bg-muted/30 rounded-lg border border-border">
      <p className="text-[11px] font-semibold text-foreground mb-2">{data.title}</p>
      <div className="flex items-end gap-1 h-[120px]">
        {data.labels.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
            <div className="flex gap-[2px] items-end h-full w-full justify-center">
              {data.datasets.map((ds, dsIdx) => (
                <div key={dsIdx} className="flex flex-col items-center justify-end h-full" style={{ flex: 1, maxWidth: hasMultipleSeries ? 20 : 32 }}>
                  <span className="text-[8px] text-muted-foreground mb-0.5 whitespace-nowrap">
                    {formatINR(ds.data[i])}
                  </span>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${(ds.data[i] / maxValue) * 90}%`,
                      minHeight: ds.data[i] > 0 ? 4 : 0,
                      backgroundColor: CHART_COLORS[dsIdx % CHART_COLORS.length],
                    }}
                  />
                </div>
              ))}
            </div>
            <span className="text-[8px] text-muted-foreground text-center leading-tight mt-1 max-w-full truncate">
              {label}
            </span>
          </div>
        ))}
      </div>
      {hasMultipleSeries && (
        <div className="flex gap-3 mt-2 justify-center">
          {data.datasets.map((ds, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-[9px] text-muted-foreground">{ds.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const chartRegex = /\[CHART\]\s*([\s\S]*?)\s*\[\/CHART\]/g;
  const segments: { type: "text" | "chart"; content: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = chartRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "chart", content: match[1].trim() });
    lastIndex = chartRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return (
    <div className="space-y-0.5">
      {segments.map((segment, sIdx) => {
        if (segment.type === "chart") {
          try {
            const chartData = JSON.parse(segment.content) as ChartData;
            if (chartData.labels && chartData.datasets) {
              return <BarChart key={`chart-${sIdx}`} data={chartData} />;
            }
          } catch {
            // malformed chart JSON, render as text
          }
        }

        const lines = segment.content.split("\n");
        return lines.map((line, i) => {
          const key = `${sIdx}-${i}`;

          const h2Match = line.match(/^##\s+(.+)/);
          if (h2Match) {
            return (
              <p key={key} className="font-semibold text-sm mt-3 first:mt-0">
                {inlineBold(h2Match[1])}
              </p>
            );
          }

          const h3Match = line.match(/^###\s+(.+)/);
          if (h3Match) {
            return (
              <p key={key} className="font-semibold text-xs mt-2 first:mt-0">
                {inlineBold(h3Match[1])}
              </p>
            );
          }

          const headingMatch = line.match(/^\*\*(.+?)\*\*$/);
          if (headingMatch) {
            return (
              <p key={key} className="font-semibold mt-2 first:mt-0">
                {headingMatch[1]}
              </p>
            );
          }

          const bulletMatch = line.match(/^\s*[\*\-]\s+(.+)/);
          if (bulletMatch) {
            return (
              <li key={key} className="ml-3 list-disc text-xs">
                {inlineBold(bulletMatch[1])}
              </li>
            );
          }

          if (line.trim() === "") {
            return <br key={key} />;
          }

          return <p key={key}>{inlineBold(line)}</p>;
        });
      })}
    </div>
  );
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
