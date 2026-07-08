import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | number | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | number | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

import { TicketStatus, TicketCategory } from "../types";

export const statusLabels: Record<TicketStatus, string> = {
  [TicketStatus.NEW]: "New",
  [TicketStatus.OPEN]: "Open",
  [TicketStatus.PROCESSING]: "Processing",
  [TicketStatus.RESOLVED]: "Resolved",
  [TicketStatus.CLOSED]: "Closed",
};

export const categoryLabels: Record<TicketCategory, string> = {
  [TicketCategory.GENERAL_QUESTION]: "General ",
  [TicketCategory.TECHNICAL_QUESTION]: "Technical ",
  [TicketCategory.REFUND_REQUEST]: "Refund",
};

export function formatStatus(status: TicketStatus | string) {
  return statusLabels[status as TicketStatus] || status || "";
}

export function formatCategory(category: TicketCategory | string) {
  return categoryLabels[category as TicketCategory] || category || "";
}
