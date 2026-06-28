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
  highlightedVendorId: string | null;
  highlightedItemId: string | null;
  isChatPanelOpen: boolean;
  filterNonCompliant: boolean;
  filterSavings: boolean;
  filterPriceRose: boolean;
  filterL1L2: boolean;

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
  highlightVendor: (vendorId: string | null) => void;
  highlightItem: (itemId: string | null) => void;
  setChatPanelOpen: (open: boolean) => void;
  setFilterNonCompliant: (on: boolean) => void;
  setFilterSavings: (on: boolean) => void;
  setFilterPriceRose: (on: boolean) => void;
  setFilterL1L2: (on: boolean) => void;
  resetFilters: () => void;
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
  highlightedVendorId: null,
  highlightedItemId: null,
  isChatPanelOpen: false,
  filterNonCompliant: false,
  filterSavings: false,
  filterPriceRose: false,
  filterL1L2: false,

  setPersona: (persona) => set({ persona }),

  setSelectedEvent: (eventId) => {
    const event = sourcingEvents.find((e) => e.id === eventId);
    if (event) {
      set({
        selectedEvent: event,
        chatMessages: [],
        recommendation: null,
        summary: null,
        filterNonCompliant: false,
        filterSavings: false,
        filterPriceRose: false,
        filterL1L2: false,
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

  highlightVendor: (vendorId) => {
    set({ highlightedVendorId: vendorId });
    if (vendorId) setTimeout(() => set({ highlightedVendorId: null }), 3000);
  },
  highlightItem: (itemId) => {
    set({ highlightedItemId: itemId });
    if (itemId) setTimeout(() => set({ highlightedItemId: null }), 3000);
  },
  setChatPanelOpen: (open) => set({ isChatPanelOpen: open }),
  setFilterNonCompliant: (on) => set({ filterNonCompliant: on }),
  setFilterSavings: (on) => set((state) => ({ filterSavings: on, filterPriceRose: on ? false : state.filterPriceRose })),
  setFilterPriceRose: (on) => set((state) => ({ filterPriceRose: on, filterSavings: on ? false : state.filterSavings })),
  setFilterL1L2: (on) => set({ filterL1L2: on }),
  resetFilters: () => set({ filterNonCompliant: false, filterSavings: false, filterPriceRose: false, filterL1L2: false }),
}));
