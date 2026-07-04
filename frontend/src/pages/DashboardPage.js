import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import { formatDate } from "../lib/utils";
const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.getTickets({ limit: "5" });
                setTickets(response.tickets);
                // Calculate stats
                const allTickets = await api.getTickets({ limit: "1000" });
                const allData = allTickets.tickets;
                setStats({
                    total: allData.length,
                    open: allData.filter((t) => t.status === "OPEN" || t.status === "NEW").length,
                    resolved: allData.filter((t) => t.status === "RESOLVED").length,
                    avgTime: "2.5 hours",
                });
            }
            catch (error) {
                console.error("Failed to fetch data:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
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
    return (_jsx(Layout, { title: "Dashboard", children: loading ? (_jsx("div", { className: "flex items-center justify-center h-96", children: "Loading..." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [
                        { label: "Total Tickets", value: stats?.total || 0 },
                        { label: "Open Tickets", value: stats?.open || 0 },
                        { label: "Resolved", value: stats?.resolved || 0 },
                        { label: "Avg Resolution", value: stats?.avgTime || "0h" },
                    ].map((stat, i) => (_jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: [_jsx("p", { className: "text-slate-600 text-sm mb-2", children: stat.label }), _jsx("p", { className: "text-3xl font-bold text-slate-900", children: stat.value })] }, i))) }), _jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-slate-200", children: _jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Recent Tickets" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Subject" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "From" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Created" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-200", children: tickets.map((ticket) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer", children: ticket.subject }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: ticket.fromEmail }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx(Badge, { variant: getStatusBadgeVariant(ticket.status), children: ticket.status }) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: formatDate(ticket.createdAt) })] }, ticket.id))) })] }) })] })] })) }));
};
export default DashboardPage;
