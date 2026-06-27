import { create } from "zustand";
import {
  Persona,
  SourcingEvent,
  ChatMessage,
  AIRecommendation,
  ProcurementSummary,
} from "@/types";
import { sourcingEvents } from "@/data/events";

interface AppState {
  persona: Persona;
  selectedEvent: SourcingEvent;
  chatMessages: ChatMessage[];
  recommendation: AIRecommendation | null;
  summary: ProcurementSummary | null;
  isLoadingRecommendation: boolean;
  isLoadingSummary: boolean;
  isLoadingChat: boolean;

  setPersona: (persona: Persona) => void;
  setSelectedEvent: (eventId: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  clearChat: () => void;
  setRecommendation: (rec: AIRecommendation | null) => void;
  setSummary: (summary: ProcurementSummary | null) => void;
  setIsLoadingRecommendation: (loading: boolean) => void;
  setIsLoadingSummary: (loading: boolean) => void;
  setIsLoadingChat: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  persona: "manager",
  selectedEvent: sourcingEvents[0],
  chatMessages: [],
  recommendation: null,
  summary: null,
  isLoadingRecommendation: false,
  isLoadingSummary: false,
  isLoadingChat: false,

  setPersona: (persona) => set({ persona }),

  setSelectedEvent: (eventId) => {
    const event = sourcingEvents.find((e) => e.id === eventId);
    if (event) {
      set({
        selectedEvent: event,
        chatMessages: [],
        recommendation: null,
        summary: null,
      });
    }
  },

  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const messages = [...state.chatMessages];
      const lastIndex = messages.length - 1;
      if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
        messages[lastIndex] = { ...messages[lastIndex], content };
      }
      return { chatMessages: messages };
    }),

  clearChat: () => set({ chatMessages: [] }),

  setRecommendation: (recommendation) => set({ recommendation }),
  setSummary: (summary) => set({ summary }),
  setIsLoadingRecommendation: (isLoadingRecommendation) =>
    set({ isLoadingRecommendation }),
  setIsLoadingSummary: (isLoadingSummary) => set({ isLoadingSummary }),
  setIsLoadingChat: (isLoadingChat) => set({ isLoadingChat }),
}));
