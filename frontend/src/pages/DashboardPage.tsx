import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import { formatDate } from "../lib/utils";
import { TicketStatus } from "../types";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await api.getTickets({ limit: "5" });
        setTickets(response.tickets);

        // Calculate stats
        const allTickets: any = await api.getTickets({ limit: "1000" });
        const allData = allTickets.tickets;

        setStats({
          total: allData.length,
          open: allData.filter(
            (t: any) => t.status === TicketStatus.OPEN || t.status === TicketStatus.NEW,
          ).length,
          resolved: allData.filter((t: any) => t.status === TicketStatus.RESOLVED).length,
          avgTime: "2.5 hours",
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Tickets", value: stats?.total || 0 },
              { label: "Open Tickets", value: stats?.open || 0 },
              { label: "Resolved", value: stats?.resolved || 0 },
              { label: "Avg Resolution", value: stats?.avgTime || "0h" },
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
                          {ticket.status}
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
