import { SourcingEvent } from "@/types";
import { itEquipmentEvent } from "./it-equipment";
import { industrialSafetyEvent } from "./industrial-safety";

export const sourcingEvents: SourcingEvent[] = [
  itEquipmentEvent,
  industrialSafetyEvent,
];

export function getEventById(id: string): SourcingEvent | undefined {
  return sourcingEvents.find((e) => e.id === id);
}
