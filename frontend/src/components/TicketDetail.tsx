import React from "react";
import { Edit2, Calendar, User } from "lucide-react";
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
  onEdit?: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onEdit }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-1.5 block">
            Ticket #{ticket.id.slice(-8).toUpperCase()}
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-950 tracking-tight mb-2.5">
            {ticket.subject}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <div className="h-4.5 w-4.5 rounded-full bg-blue-50 text-blue-600 font-extrabold text-[9px] flex items-center justify-center shrink-0">
                {getInitials(ticket.fromName || ticket.fromEmail)}
              </div>
              <span className="text-slate-600 font-semibold">{ticket.fromName}</span>
              <span className="text-slate-400 font-medium">({ticket.fromEmail})</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Created {formatDateTime(ticket.createdAt)}
            </span>
          </div>
        </div>
        
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Edit2 size={13} />
            Edit Ticket
          </button>
        )}
      </div>
      
      <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-6 rounded-xl border border-slate-100/60">
        {ticket.body}
      </div>
    </div>
  );
};

export default TicketDetail;
