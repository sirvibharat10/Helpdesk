import React from "react";
import { formatDateTime } from "../lib/utils";

interface TicketDetailProps {
  ticket: {
    id: string;
    subject: string;
    body: string;
    fromName: string;
    fromEmail: string;
    createdAt: string;
  };
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {ticket.subject}
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>
            From: {ticket.fromName} ({ticket.fromEmail})
          </span>
          <span>Created: {formatDateTime(ticket.createdAt)}</span>
        </div>
      </div>
      <p className="text-slate-700 whitespace-pre-wrap">{ticket.body}</p>
    </div>
  );
};

export default TicketDetail;
