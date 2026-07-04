import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Textarea from "../components/Textarea";
import { formatDateTime } from "../lib/utils";
import { Send, Save, FileText, MessageSquare, Bot } from "lucide-react";
const TicketDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
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
            const data = await api.getTicketById(id);
            setTicket(data);
        }
        catch (error) {
            console.error("Failed to fetch ticket:", error);
            navigate("/tickets");
        }
        finally {
            setLoading(false);
        }
    };
    const handleStatusChange = async (newStatus) => {
        try {
            const updated = await api.updateTicket(id, { status: newStatus });
            setTicket(updated);
        }
        catch (error) {
            alert("Failed to update status");
        }
    };
    const handleCategoryChange = async (newCategory) => {
        try {
            const updated = await api.updateTicket(id, { category: newCategory });
            setTicket(updated);
        }
        catch (error) {
            alert("Failed to update category");
        }
    };
    const handleAddReply = async (sentViaEmail) => {
        if (!replyBody.trim())
            return;
        try {
            setSendingReply(true);
            const reply = await api.addReply(id, replyBody, sentViaEmail);
            await fetchTicket();
            setReplyBody("");
        }
        catch (error) {
            alert("Failed to add reply");
        }
        finally {
            setSendingReply(false);
        }
    };
    const handleClassify = async () => {
        try {
            setClassifying(true);
            const updated = await api.classifyTicket(id);
            setTicket(updated);
        }
        catch (error) {
            alert("Failed to classify ticket");
        }
        finally {
            setClassifying(false);
        }
    };
    const handleSummarize = async () => {
        try {
            setSummarizing(true);
            const updated = await api.summarizeTicket(id);
            setTicket(updated);
        }
        catch (error) {
            alert("Failed to summarize ticket");
        }
        finally {
            setSummarizing(false);
        }
    };
    const handleSuggestReply = async () => {
        try {
            setSuggestingReply(true);
            const updated = await api.suggestReply(id);
            setTicket(updated);
        }
        catch (error) {
            alert("Failed to suggest reply");
        }
        finally {
            setSuggestingReply(false);
        }
    };
    if (loading)
        return (_jsx(Layout, { title: "Ticket", children: _jsx("div", { children: "Loading..." }) }));
    const getStatusBadgeVariant = (status) => {
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
    return (_jsx(Layout, { title: `Ticket: ${ticket.subject}`, children: _jsxs("div", { className: "grid grid-cols-3 gap-6", children: [_jsxs("div", { className: "col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-2xl font-bold text-slate-900 mb-2", children: ticket.subject }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-slate-600", children: [_jsxs("span", { children: ["From: ", ticket.fromName, " (", ticket.fromEmail, ")"] }), _jsxs("span", { children: ["Created: ", formatDateTime(ticket.createdAt)] })] })] }), _jsx("p", { className: "text-slate-700 whitespace-pre-wrap", children: ticket.body })] }), _jsxs("div", { className: "bg-blue-50 p-6 rounded-xl border border-blue-200", children: [_jsxs("h3", { className: "font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Bot, { size: 18 }), " AI Tools"] }), _jsxs("div", { className: "flex gap-3 flex-wrap", children: [_jsx(Button, { variant: "secondary", onClick: handleClassify, loading: classifying, size: "sm", children: "Classify" }), _jsxs(Button, { variant: "secondary", onClick: handleSummarize, loading: summarizing, size: "sm", children: [_jsx(FileText, { size: 16 }), " Summarize"] }), _jsxs(Button, { variant: "secondary", onClick: handleSuggestReply, loading: suggestingReply, size: "sm", children: [_jsx(MessageSquare, { size: 16 }), " Suggest Reply"] })] })] }), ticket.summary && (_jsxs("div", { className: "bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500", children: [_jsx("p", { className: "text-sm font-medium text-blue-900 mb-2", children: "Summary:" }), _jsx("p", { className: "text-sm text-blue-800", children: ticket.summary })] })), ticket.suggestedReply && (_jsxs("div", { className: "bg-green-100 p-4 rounded-lg border-l-4 border-green-500", children: [_jsx("p", { className: "text-sm font-medium text-green-900 mb-2", children: "Suggested Reply:" }), _jsx("p", { className: "text-sm text-green-800 mb-3", children: ticket.suggestedReply }), _jsx(Button, { size: "sm", onClick: () => setReplyBody(ticket.suggestedReply), children: "Use This Reply" })] })), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: [_jsxs("h3", { className: "font-semibold text-slate-900 mb-4", children: ["Replies (", ticket.replies.length, ")"] }), _jsx("div", { className: "space-y-4 max-h-96 overflow-y-auto", children: ticket.replies.map((reply) => (_jsxs("div", { className: "p-4 bg-slate-50 rounded-lg border border-slate-200", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("span", { className: "font-medium text-slate-900", children: reply.isAI ? "Bot" : reply.author?.name || "Unknown" }), _jsx("span", { className: "text-xs text-slate-600", children: formatDateTime(reply.createdAt) })] }), _jsx("p", { className: "text-slate-700 text-sm whitespace-pre-wrap", children: reply.body })] }, reply.id))) })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: [_jsx("h3", { className: "font-semibold text-slate-900 mb-4", children: "Add Reply" }), _jsx(Textarea, { value: replyBody, onChange: (e) => setReplyBody(e.target.value), placeholder: "Type your reply...", rows: 4 }), _jsxs("div", { className: "flex gap-3 mt-4", children: [_jsxs(Button, { onClick: () => handleAddReply(true), loading: sendingReply, children: [_jsx(Send, { size: 16 }), " Send via Email"] }), _jsxs(Button, { variant: "secondary", onClick: () => handleAddReply(false), loading: sendingReply, children: [_jsx(Save, { size: 16 }), " Save as Note"] })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: [_jsx("h3", { className: "font-semibold text-slate-900 mb-3", children: "Status" }), _jsxs("select", { value: ticket.status, onChange: (e) => handleStatusChange(e.target.value), className: "w-full px-3 py-2 border border-slate-300 rounded-lg", children: [_jsx("option", { value: "NEW", children: "New" }), _jsx("option", { value: "OPEN", children: "Open" }), _jsx("option", { value: "PROCESSING", children: "Processing" }), _jsx("option", { value: "RESOLVED", children: "Resolved" }), _jsx("option", { value: "CLOSED", children: "Closed" })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: [_jsx("h3", { className: "font-semibold text-slate-900 mb-3", children: "Category" }), _jsxs("select", { value: ticket.category, onChange: (e) => handleCategoryChange(e.target.value), className: "w-full px-3 py-2 border border-slate-300 rounded-lg", children: [_jsx("option", { value: "GENERAL_QUESTION", children: "General Question" }), _jsx("option", { value: "TECHNICAL_QUESTION", children: "Technical Question" }), _jsx("option", { value: "REFUND_REQUEST", children: "Refund Request" })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: [_jsx("h3", { className: "font-semibold text-slate-900 mb-3", children: "Info" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-slate-600", children: "Source" }), _jsx("p", { className: "font-medium text-slate-900", children: ticket.source })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-600", children: "AI Classified" }), _jsx("p", { className: "font-medium text-slate-900", children: ticket.aiClassified ? "Yes" : "No" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-600", children: "AI Resolved" }), _jsx("p", { className: "font-medium text-slate-900", children: ticket.aiResolved ? "Yes" : "No" })] })] })] })] })] }) }));
};
export default TicketDetailPage;
