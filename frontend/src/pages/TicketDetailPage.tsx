import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Textarea from "../components/Textarea";
import Badge from "../components/Badge";
import Select from "../components/Select";
import { formatDateTime, formatDate, formatStatus, formatCategory } from "../lib/utils";
import { Send, Save, Wand2, Bot, Sparkles, X } from "lucide-react";
import { TicketStatus, TicketCategory } from "../types";
import TicketDetail from "../components/TicketDetail";

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [suggestingReply, setSuggestingReply] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<TicketStatus>(TicketStatus.NEW);
  const [draftCategory, setDraftCategory] = useState<TicketCategory>(TicketCategory.GENERAL_QUESTION);
  const [draftAssignee, setDraftAssignee] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTicket();
    fetchUsers();
  }, [id]);

  useEffect(() => {
    if (
      !ticket ||
      ![TicketStatus.NEW, TicketStatus.PROCESSING].includes(ticket.status)
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      fetchTicket(false);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [id, ticket?.status]);

  const fetchTicket = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const data: any = await api.getTicketById(id!);
      setTicket(data);
      // Sync drawer drafts
      setDraftStatus(data.status);
      setDraftCategory(data.category);
      setDraftAssignee(data.assignedToId);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      navigate("/tickets");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data: any = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const updated = await api.updateTicket(id!, {
        status: draftStatus,
        category: draftCategory,
        assignedToId: draftAssignee === "" ? null : draftAssignee,
      });
      setTicket(updated);
      setDrawerOpen(false);
    } catch (error) {
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddReply = async (sentViaEmail: boolean) => {
    if (!replyBody.trim()) return;

    try {
      setSendingReply(true);
      await api.addReply(id!, replyBody, sentViaEmail);
      await fetchTicket();
      setReplyBody("");
    } catch (error) {
      alert("Failed to add reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleClassify = async () => {
    try {
      setClassifying(true);
      const updated: any = await api.classifyTicket(id!);
      setTicket(updated);
      // Sync drawer values after auto update
      setDraftStatus(updated.status);
      setDraftCategory(updated.category);
    } catch (error) {
      alert("Failed to classify ticket");
    } finally {
      setClassifying(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      const updated = await api.summarizeTicket(id!);
      setTicket(updated);
    } catch (error) {
      alert("Failed to summarize ticket");
    } finally {
      setSummarizing(false);
    }
  };

  const handleSuggestReply = async () => {
    try {
      setSuggestingReply(true);
      const updated = await api.suggestReply(id!);
      setTicket(updated);
    } catch (error) {
      alert("Failed to suggest reply");
    } finally {
      setSuggestingReply(false);
    }
  };

  const handlePolish = async () => {
    if (!replyBody.trim()) return;
    try {
      setPolishing(true);
      const result: any = await api.polishReply(id!, replyBody);
      setReplyBody(result.polishedReply);
    } catch (error) {
      alert("Failed to polish reply");
    } finally {
      setPolishing(false);
    }
  };

  const getStatusBadgeVariant = (status: string): any => {
    switch (status) {
      case TicketStatus.NEW:
        return "new";
      case TicketStatus.OPEN:
        return "open";
      case TicketStatus.PROCESSING:
        return "processing";
      case TicketStatus.RESOLVED:
        return "resolved";
      case TicketStatus.CLOSED:
        return "closed";
      default:
        return "default";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Layout title="Ticket Details">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="text-sm font-medium text-slate-500">Loading conversation details...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ticket Details">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
        
        {/* Ticket Header Actions Row */}
        <div className="flex items-center gap-3 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <Badge variant={getStatusBadgeVariant(ticket.status)}>
            {formatStatus(ticket.status)}
          </Badge>
          <span className="text-slate-400 font-bold text-xs uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
            {formatCategory(ticket.category)}
          </span>
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            Assigned: <span className="text-slate-700">{ticket.assignedTo?.name || "Unassigned"}</span>
          </span>
        </div>

        {/* Main Ticket Content Card */}
        <TicketDetail ticket={ticket} onEdit={() => setDrawerOpen(true)} />

        {/* AI Tools Widget */}
        <div className="bg-gradient-to-r from-sky-50/50 via-blue-50/20 to-white p-6 rounded-2xl border border-blue-100/70 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 text-blue-500/5 pointer-events-none">
            <Bot size={120} />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 relative z-10">
            <Sparkles size={16} className="text-blue-500 fill-blue-100" />
            AI Co-Pilot Utilities
          </h3>
          <div className="flex gap-3 flex-wrap relative z-10">
            <button
              onClick={handleClassify}
              disabled={classifying}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {classifying ? "Classifying..." : "🤖 Classify Ticket"}
            </button>
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {summarizing ? "Summarizing..." : "📝 Generate Summary"}
            </button>
            <button
              onClick={handleSuggestReply}
              disabled={suggestingReply}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {suggestingReply ? "Creating draft..." : "✉️ Suggest AI Response"}
            </button>
          </div>
        </div>

        {/* Summarization Section */}
        {ticket.summary && (
          <div className="bg-sky-50/30 p-5 rounded-2xl border border-blue-100 border-l-4 border-l-blue-500 shadow-sm">
            <p className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">AI Ticket Summary</p>
            <p className="text-slate-700 text-sm leading-relaxed">{ticket.summary}</p>
          </div>
        )}

        {/* Suggested Response Dialog option */}
        {ticket.suggestedReply && (
          <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm space-y-3">
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Suggested AI Draft</p>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.suggestedReply}</p>
            <button
              onClick={() => setReplyBody(ticket.suggestedReply)}
              className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Apply this draft to Composer
            </button>
          </div>
        )}

        {/* Conversation History List */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Conversational Feed ({ticket.replies.length})
          </h3>
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {ticket.replies.length === 0 ? (
              <p className="text-slate-400 text-xs italic text-center py-6">No previous replies in this thread.</p>
            ) : (
              ticket.replies.map((reply: any) => (
                <div
                  key={reply.id}
                  className={`p-5 rounded-2xl border transition-colors ${
                    reply.senderType === "AI"
                      ? "bg-violet-50/10 border-violet-100"
                      : reply.senderType === "AGENT"
                      ? "bg-slate-50/40 border-slate-100"
                      : "bg-blue-50/10 border-blue-100"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(reply.senderType === "AI" ? "AI Bot" : reply.author?.name || "Customer")}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">
                          {reply.senderType === "AI" ? "My HelpDesk AI" : reply.author?.name || "Customer"}
                        </span>
                        <span className="mx-2 text-slate-300">·</span>
                        <Badge variant={
                          reply.senderType === "AGENT" ? "open" :
                          reply.senderType === "AI" ? "processing" : "new"
                        }>
                          {reply.senderType === "AGENT" ? "Agent" :
                           reply.senderType === "AI" ? "AI System" : "Customer"}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {formatDateTime(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap pl-9">
                    {reply.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Response Composer Component */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Add Response</h3>
          <Textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write your email response or internal notes here..."
            rows={4}
          />
          <div className="flex gap-2.5 flex-wrap pt-1">
            <Button
              variant="secondary"
              onClick={handlePolish}
              loading={polishing}
              disabled={!replyBody.trim()}
              className="flex items-center gap-1.5"
            >
              <Wand2 size={14} /> AI Polish
            </Button>
            <Button
              onClick={() => handleAddReply(true)}
              loading={sendingReply}
              disabled={!replyBody.trim()}
              className="flex items-center gap-1.5"
            >
              <Send size={14} /> Send Email
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleAddReply(false)}
              loading={sendingReply}
              disabled={!replyBody.trim()}
              className="flex items-center gap-1.5"
            >
              <Save size={14} /> Save internal Note
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Editing Ticket Details */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 flex justify-end animate-backdrop-in"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-[400px] max-w-full bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200/60 animate-slide-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Edit Settings</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Update status, routing, and metadata</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                aria-label="Close settings"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inputs & Parameters */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <Select
                  label="Status State"
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as any)}
                  options={Object.values(TicketStatus).map((status) => ({
                    value: status,
                    label: formatStatus(status),
                  }))}
                />
                
                <Select
                  label="Category Topic"
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value as any)}
                  options={Object.values(TicketCategory).map((cat) => ({
                    value: cat,
                    label: formatCategory(cat),
                  }))}
                />

                <Select
                  label="Assigned Agent"
                  value={draftAssignee || ""}
                  onChange={(e) => setDraftAssignee(e.target.value)}
                  placeholder="Unassigned"
                  options={users.map((u) => ({
                    value: u.id,
                    label: `${u.name} (${u.role})`,
                  }))}
                />
              </div>

              {/* Readonly Info Section */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Readonly Information</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/80 space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Source</span>
                    <span className="font-semibold text-slate-700">{ticket.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">AI Classified</span>
                    <span className={`font-semibold ${ticket.aiClassified ? "text-emerald-600" : "text-slate-500"}`}>
                      {ticket.aiClassified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">AI Auto-Resolved</span>
                    <span className={`font-semibold ${ticket.aiResolved ? "text-emerald-600" : "text-slate-500"}`}>
                      {ticket.aiResolved ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Created At</span>
                    <span className="font-medium text-slate-500">{formatDateTime(ticket.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Last Updated</span>
                    <span className="font-medium text-slate-500">{formatDateTime(ticket.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer triggers */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.01)]">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-750 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TicketDetailPage;
