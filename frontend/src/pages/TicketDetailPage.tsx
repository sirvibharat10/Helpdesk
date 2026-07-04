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

  useEffect(() => {
    fetchTicket();
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

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await api.updateTicket(id!, { status: newStatus });
      setTicket(updated);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleCategoryChange = async (newCategory: string) => {
    try {
      const updated = await api.updateTicket(id!, { category: newCategory });
      setTicket(updated);
    } catch (error) {
      alert("Failed to update category");
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
      case "NEW":
        return "new";
      case "OPEN":
        return "open";
      case "PROCESSING":
        return "processing";
      case "RESOLVED":
        return "resolved";
      case "CLOSED":
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
          {/* Ticket Info */}
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
                    <span className="font-medium text-slate-900">
                      {reply.isAI ? "Bot" : reply.author?.name || "Unknown"}
                    </span>
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
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Status</h3>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="PROCESSING">Processing</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Category */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Category</h3>
            <select
              value={ticket.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="GENERAL_QUESTION">General Question</option>
              <option value="TECHNICAL_QUESTION">Technical Question</option>
              <option value="REFUND_REQUEST">Refund Request</option>
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
      </div>
    </Layout>
  );
};

export default TicketDetailPage;
