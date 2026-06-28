"use client";

import { useAppStore } from "@/stores/app-store";
import { sourcingEvents } from "@/data/events";
import { cn } from "@/lib/utils";
import { Package, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function EventSelector() {
  const { selectedEvent, setSelectedEvent } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2" ref={ref}>
      <Package className="w-4 h-4 text-muted-foreground" />
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 h-8 px-3 rounded-lg border border-input bg-card text-sm hover:bg-muted transition-colors min-w-[380px]"
        >
          <span className="flex-1 text-left truncate">{selectedEvent.name}</span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
            {sourcingEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors",
                  event.id === selectedEvent.id && "bg-accent text-accent-foreground"
                )}
              >
                <Check className={cn("w-3.5 h-3.5 shrink-0", event.id === selectedEvent.id ? "opacity-100" : "opacity-0")} />
                <div>
                  <div className="font-medium">{event.name}</div>
                  <div className="text-[10px] text-muted-foreground">{event.category}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
