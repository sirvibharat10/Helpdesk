import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import { formatDate, formatStatus } from "../lib/utils";
import { TicketStatus } from "../types";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format "2026-07-09" → "Jul 9"
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

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-96">Loading...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[
              { label: "Total Tickets", value: stats?.total ?? 0 },
              { label: "Open Tickets", value: stats?.open ?? 0 },
              { label: "AI Resolved", value: stats?.aiResolvedCount ?? 0 },
              { label: "AI Resolved %", value: `${stats?.aiResolvedPercentage ?? 0}%` },
              { label: "Avg Resolution", value: stats?.avgResolutionTime ?? "N/A" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
              >
                <p className="text-slate-600 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Daily Tickets Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              Tickets per Day — Last 30 Days
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [value, "Tickets"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Recent Tickets
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[...tickets]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer">
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {ticket.fromEmail}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                          {formatStatus(ticket.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default DashboardPage;


