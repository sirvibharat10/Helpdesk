import React from "react";
import { TicketStatus, TicketCategory } from "../types";
import { formatStatus, formatCategory } from "../lib/utils";

interface UpdateTicketProps {
  ticket: {
    status: TicketStatus;
    category: TicketCategory;
    assignedToId: string | null;
    source: string;
    aiClassified: boolean;
    aiResolved: boolean;
  };
  users: Array<{ id: string; name: string; role: string }>;
  updatingStatus: boolean;
  updatingCategory: boolean;
  updatingAssignee: boolean;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onAssigneeChange: (userId: string) => void;
}

const UpdateTicket: React.FC<UpdateTicketProps> = ({
  ticket,
  users,
  updatingStatus,
  updatingCategory,
  updatingAssignee,
  onStatusChange,
  onCategoryChange,
  onAssigneeChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Status</h3>
        <select
          value={ticket.status}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={updatingStatus}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:opacity-50"
        >
          {Object.values(TicketStatus).map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Category</h3>
        <select
          value={ticket.category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={updatingCategory}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:opacity-50"
        >
          {Object.values(TicketCategory).map((cat) => (
            <option key={cat} value={cat}>
              {formatCategory(cat)}
            </option>
          ))}
        </select>
      </div>

      {/* Assigned Agent */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Assigned Agent</h3>
        <select
          value={ticket.assignedToId || ""}
          onChange={(e) => onAssigneeChange(e.target.value)}
          disabled={updatingAssignee}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
      </div>

      {/* Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Info</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-600">Source</p>
            <p className="font-medium text-slate-900">{ticket.source}</p>
          </div>
          <div>
            <p className="text-slate-600">AI Classified</p>
            <p className="font-medium text-slate-900">
              {ticket.aiClassified ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-slate-600">AI Resolved</p>
            <p className="font-medium text-slate-900">
              {ticket.aiResolved ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTicket;
