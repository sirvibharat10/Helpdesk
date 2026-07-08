import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Badge from "../components/Badge";
import { formatDateTime } from "../lib/utils";
import { Send, Save, Wand2, FileText, MessageSquare, Bot } from "lucide-react";
import { TicketStatus, TicketCategory } from "../types";
import TicketDetail from "../components/TicketDetail";
import UpdateTicket from "../components/UpdateTicket";

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
  const [users, setUsers] = useState<any[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  useEffect(() => {
    fetchTicket();
    fetchUsers();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const data: any = await api.getTicketById(id!);
      setTicket(data);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      navigate("/tickets");
    } finally {
      setLoading(false);
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

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const updated = await api.updateTicket(id!, { status: newStatus });
      setTicket(updated);
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCategoryChange = async (newCategory: string) => {
    try {
      setUpdatingCategory(true);
      const updated = await api.updateTicket(id!, { category: newCategory });
      setTicket(updated);
    } catch (error) {
      alert("Failed to update category");
    } finally {
      setUpdatingCategory(false);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    try {
      setUpdatingAssignee(true);
      const updated = await api.updateTicket(id!, {
        assignedToId: userId === "" ? null : userId,
      });
      setTicket(updated);
    } catch (error) {
      alert("Failed to update assignee");
    } finally {
      setUpdatingAssignee(false);
    }
  };

  const handleAddReply = async (sentViaEmail: boolean) => {
    if (!replyBody.trim()) return;

    try {
      setSendingReply(true);
      const reply = await api.addReply(id!, replyBody, sentViaEmail);
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
      const updated = await api.classifyTicket(id!);
      setTicket(updated);
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

  if (loading)
    return (
      <Layout title="Ticket">
        <div>Loading...</div>
      </Layout>
    );

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

  return (
    <Layout title={`Ticket: ${ticket.subject}`}>
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          <TicketDetail ticket={ticket} />

          {/* AI Tools */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Bot size={18} /> AI Tools
            </h3>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant="secondary"
                onClick={handleClassify}
                loading={classifying}
                size="sm"
              >
                Classify
              </Button>
              <Button
                variant="secondary"
                onClick={handleSummarize}
                loading={summarizing}
                size="sm"
              >
                <FileText size={16} /> Summarize
              </Button>
              <Button
                variant="secondary"
                onClick={handleSuggestReply}
                loading={suggestingReply}
                size="sm"
              >
                <MessageSquare size={16} /> Suggest Reply
              </Button>
            </div>
          </div>

          {/* Summary */}
          {ticket.summary && (
            <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-medium text-blue-900 mb-2">Summary:</p>
              <p className="text-sm text-blue-800">{ticket.summary}</p>
            </div>
          )}

          {/* Suggested Reply */}
          {ticket.suggestedReply && (
            <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm font-medium text-green-900 mb-2">
                Suggested Reply:
              </p>
              <p className="text-sm text-green-800 mb-3">
                {ticket.suggestedReply}
              </p>
              <Button
                size="sm"
                onClick={() => setReplyBody(ticket.suggestedReply)}
              >
                Use This Reply
              </Button>
            </div>
          )}

          {/* Replies */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">
              Replies ({ticket.replies.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {ticket.replies.map((reply: any) => (
                <div
                  key={reply.id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {reply.senderType === "AI" ? "Bot" : reply.author?.name || "Customer"}
                      </span>
                      <Badge variant={
                        reply.senderType === "AGENT" ? "open" :
                        reply.senderType === "AI" ? "processing" : "new"
                      }>
                        {reply.senderType === "AGENT" ? "Agent" :
                         reply.senderType === "AI" ? "AI Bot" : "Customer"}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-600">
                      {formatDateTime(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">
                    {reply.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Composer */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Add Reply</h3>
            <Textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => handleAddReply(true)}
                loading={sendingReply}
              >
                <Send size={16} /> Send via Email
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleAddReply(false)}
                loading={sendingReply}
              >
                <Save size={16} /> Save as Note
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <UpdateTicket
          ticket={ticket}
          users={users}
          updatingStatus={updatingStatus}
          updatingCategory={updatingCategory}
          updatingAssignee={updatingAssignee}
          onStatusChange={handleStatusChange}
          onCategoryChange={handleCategoryChange}
          onAssigneeChange={handleAssigneeChange}
        />
      </div>
    </Layout>
  );
};

export default TicketDetailPage;
