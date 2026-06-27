"use client";

import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { UserCog, Crown } from "lucide-react";

export function WorkspaceToggle() {
  const { persona, setPersona } = useAppStore();

  return (
    <div className="flex items-center bg-muted rounded-lg p-0.5">
      <button
        onClick={() => setPersona("manager")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          persona === "manager"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <UserCog className="w-3.5 h-3.5" />
        Manager
      </button>
      <button
        onClick={() => setPersona("head")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          persona === "head"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Crown className="w-3.5 h-3.5" />
        Head of Procurement
      </button>
    </div>
  );
}
