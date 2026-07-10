import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Layers,
  Bot,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Inbox,
  CheckCircle2,
  Zap,
  Shield,
  Activity,
  Plus,
  Mail,
  ChevronRight,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import { formatDate, formatStatus, formatCategory } from "../lib/utils";
import { TicketStatus } from "../types";
import { useAuth } from "../lib/auth";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, statsRes, dailyRes]: any = await Promise.all([
          api.getTickets({ limit: "5" }),
          api.getStats(),
          api.getDailyStats(),
        ]);
        setTickets(recentRes.tickets);
        setStats(statsRes);
        setDailyStats(dailyRes);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartData = dailyStats.map((d) => ({
    ...d,
    label: formatDay(d.date),
  }));

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout title="Overview">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="text-sm font-medium text-slate-500">Curating your workspace metrics...</span>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-sky-50 via-blue-50/40 to-white p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/5 via-transparent to-transparent opacity-70"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold tracking-wider uppercase mb-1.5">
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
                My HelpDesk Workspace
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                {getGreeting()}, {user?.name || "Agent"}!
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-xl">
                The AI co-pilot is currently managing incoming tickets. The system efficiency is up by 14% today.
              </p>
            </div>
            <div className="flex gap-3 relative z-10">
              <Link
                to="/tickets"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
              >
                <Plus size={16} />
                Create Ticket
              </Link>
              <Link
                to="/email-setup"
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all hover:border-slate-300 active:scale-95"
              >
                <Mail size={16} />
                Email Settings
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                label: "Total Tickets",
                value: stats?.total ?? 0,
                desc: "All-time received tickets",
                icon: Inbox,
                color: "text-indigo-600 bg-indigo-50 border-indigo-100",
                badge: { val: "+4.2%", positive: true },
              },
              {
                label: "Open Tickets",
                value: stats?.open ?? 0,
                desc: "Awaiting human agent attention",
                icon: Activity,
                color: "text-amber-600 bg-amber-50 border-amber-100",
                badge: { val: "Active", positive: true },
              },
              {
                label: "AI Resolved",
                value: stats?.aiResolvedCount ?? 0,
                desc: "Auto-closed by My HelpDesk AI",
                icon: Bot,
                color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                badge: { val: `+${stats?.aiResolvedPercentage ?? 0}%`, positive: true },
              },
              {
                label: "AI Resolved %",
                value: `${stats?.aiResolvedPercentage ?? 0}%`,
                desc: "AI success resolution rate",
                icon: Sparkles,
                color: "text-violet-600 bg-violet-50 border-violet-100",
                badge: { val: "Optimal", positive: true },
              },
              {
                label: "Avg Resolution",
                value: stats?.avgResolutionTime ?? "N/A",
                desc: "Time taken to resolve tickets",
                icon: Clock,
                color: "text-sky-600 bg-sky-50 border-sky-100",
                badge: { val: "-12m", positive: true },
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-slate-500 font-semibold text-xs tracking-wider uppercase">
                      {stat.label}
                    </span>
                    <div className={`p-2.5 rounded-xl ${stat.color} border transition-all duration-300 group-hover:scale-110`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-slate-400 text-xs leading-normal">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Split Analytics and Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col (2/3) - Chart & Recent Tickets */}
            <div className="lg:col-span-2 space-y-8">
              {/* Chart Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Ticket Ingestion Trends
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Visualizing incoming support requests over the past 30 days
                    </p>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setChartType("area")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        chartType === "area"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Area
                    </button>
                    <button
                      onClick={() => setChartType("bar")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        chartType === "bar"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Bar
                    </button>
                  </div>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "area" ? (
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                          interval={4}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                          width={40}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                          formatter={(value) => [Number(value), "Tickets"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        barSize={12}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                          interval={4}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                          width={40}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                          formatter={(value) => [Number(value), "Tickets"]}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Tickets Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Recent Conversations
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      The latest incoming inquiries requiring review
                    </p>
                  </div>
                  <Link
                    to="/tickets"
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    View All Queue
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  {tickets.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                      No tickets found in the queue.
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...tickets]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((ticket) => (
                            <tr
                              key={ticket.id}
                              onClick={() => navigate(`/tickets/${ticket.id}`)}
                              className="hover:bg-slate-50/75 cursor-pointer transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-slate-800 hover:text-indigo-600 line-clamp-1">
                                  {ticket.subject}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono tracking-tighter">
                                  #{ticket.id}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                                    {getInitials(ticket.fromName || ticket.fromEmail)}
                                  </div>
                                  <div className="text-xs">
                                    <div className="font-semibold text-slate-700">{ticket.fromName}</div>
                                    <div className="text-slate-400">{ticket.fromEmail}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={getStatusBadgeVariant(ticket.status)}>
                                  {formatStatus(ticket.status)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-400">
                                {formatDate(ticket.createdAt)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col (1/3) - Quick Actions & AI Status Panel */}
            <div className="space-y-8">
              {/* AI Engine Panel */}
              <div className="bg-gradient-to-br from-white to-blue-50/20 rounded-2xl border border-blue-100 p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 text-blue-500/5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  <Bot size={160} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs tracking-wider uppercase">
                      <Zap size={14} className="text-blue-500 fill-blue-500 animate-pulse" />
                      AI Co-Pilot Live
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Online
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">My HelpDesk Auto-Resolution</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      My HelpDesk utilizes Gemini LLM to interpret incoming tickets, compare requests with the active knowledge-base, and automatically resolve them.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Gemini LLM model</span>
                      <span className="font-semibold text-slate-700">gemini-3.5-flash</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Confidence Threshold</span>
                      <span className="font-semibold text-slate-700">75%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">SMTP Outbox</span>
                      <span className="font-semibold text-emerald-600">Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">
                  Quick Utilities
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/tickets"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Inbox size={16} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-semibold text-slate-800">
                          Inspect Tickets
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Filter and solve pending tickets
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    to="/email-setup"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Mail size={16} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-semibold text-slate-800">
                          Simulate Incoming Email
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Test IMAP email poller flow
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* System Stats Insights */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    My HelpDesk AI Efficiency Tips
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-indigo-50 rounded text-indigo-600">
                      <Sparkles size={12} />
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">
                      Adding detailed Q&A to the knowledge base increases resolution success by 8% on average.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-indigo-50 rounded text-indigo-600">
                      <Shield size={12} />
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">
                      The Escalation Policy automatically shifts complex billing requests or chargebacks to your agent inbox.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;
