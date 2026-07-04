import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Input from "../components/Input";
import Badge from "../components/Badge";
import Dialog from "../components/Dialog";
import Textarea from "../components/Textarea";
import { formatDate } from "../lib/utils";
const TicketsPage = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const createTicketSchema = z.object({
        subject: z.string().min(1, "Subject is required"),
        body: z.string().min(10, "Description is required"),
        fromEmail: z.string().email("Invalid email"),
        fromName: z.string().min(1, "Name is required"),
    });
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        resolver: zodResolver(createTicketSchema),
        defaultValues: {
            subject: "",
            body: "",
            fromEmail: "",
            fromName: "",
        },
    });
    const [filters, setFilters] = useState({
        status: "",
        category: "",
        search: "",
    });
    useEffect(() => {
        fetchTickets();
    }, [filters]);
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await api.getTickets(filters);
            setTickets(response.tickets);
        }
        catch (error) {
            console.error("Failed to fetch tickets:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateTicket = async (data) => {
        try {
            await api.createTicket(data);
            setCreateDialogOpen(false);
            reset();
            fetchTickets();
        }
        catch (error) {
            alert("Failed to create ticket");
        }
    };
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
    return (_jsxs(Layout, { title: "Tickets", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-4", children: [_jsxs("select", { value: filters.status, onChange: (e) => setFilters({ ...filters, status: e.target.value }), className: "px-4 py-2 border border-slate-300 rounded-lg", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "NEW", children: "New" }), _jsx("option", { value: "OPEN", children: "Open" }), _jsx("option", { value: "PROCESSING", children: "Processing" }), _jsx("option", { value: "RESOLVED", children: "Resolved" }), _jsx("option", { value: "CLOSED", children: "Closed" })] }), _jsxs("select", { value: filters.category, onChange: (e) => setFilters({ ...filters, category: e.target.value }), className: "px-4 py-2 border border-slate-300 rounded-lg", children: [_jsx("option", { value: "", children: "All Categories" }), _jsx("option", { value: "GENERAL_QUESTION", children: "General Question" }), _jsx("option", { value: "TECHNICAL_QUESTION", children: "Technical Question" }), _jsx("option", { value: "REFUND_REQUEST", children: "Refund Request" })] }), _jsx(Input, { placeholder: "Search...", value: filters.search, onChange: (e) => setFilters({ ...filters, search: e.target.value }) }), _jsx(Button, { onClick: () => setCreateDialogOpen(true), children: "+ New Ticket" })] }) }), loading ? (_jsx("div", { className: "flex items-center justify-center p-12", children: "Loading..." })) : (_jsx("div", { className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Subject" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "From" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Category" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Created" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-200", children: tickets.map((ticket) => (_jsxs("tr", { className: "hover:bg-slate-50 cursor-pointer", onClick: () => navigate(`/tickets/${ticket.id}`), children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-blue-600", children: ticket.subject }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: ticket.fromEmail }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx(Badge, { variant: getStatusBadgeVariant(ticket.status), children: ticket.status }) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: ticket.category }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: formatDate(ticket.createdAt) })] }, ticket.id))) })] }) }) }))] }), _jsx(Dialog, { open: createDialogOpen, onOpenChange: setCreateDialogOpen, title: "Create New Ticket", children: _jsxs("form", { onSubmit: handleSubmit(handleCreateTicket), className: "space-y-4", children: [_jsx(Input, { label: "Subject", required: true, placeholder: "Ticket subject", ...register("subject"), error: errors.subject?.message }), _jsx(Textarea, { label: "Description", required: true, placeholder: "Ticket description", rows: 4, ...register("body"), error: errors.body?.message }), _jsx(Input, { label: "From Name", required: true, placeholder: "Customer name", ...register("fromName"), error: errors.fromName?.message }), _jsx(Input, { label: "From Email", type: "email", required: true, placeholder: "customer@example.com", ...register("fromEmail"), error: errors.fromEmail?.message }), _jsx(Button, { type: "submit", className: "w-full", children: "Create Ticket" })] }) })] }));
};
export default TicketsPage;
