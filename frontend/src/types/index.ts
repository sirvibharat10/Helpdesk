export enum UserRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}

export const TicketStatus = {
  NEW: "NEW",
  OPEN: "OPEN",
  PROCESSING: "PROCESSING",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const TicketCategory = {
  GENERAL_QUESTION: "GENERAL_QUESTION",
  TECHNICAL_QUESTION: "TECHNICAL_QUESTION",
  REFUND_REQUEST: "REFUND_REQUEST",
} as const;

export type TicketCategory = typeof TicketCategory[keyof typeof TicketCategory];
