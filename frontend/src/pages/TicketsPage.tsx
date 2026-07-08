import React, { useEffect, useState } from "react";
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
import { TicketStatus, TicketCategory } from "../types";

const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const createTicketSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(10, "Description is required"),
    fromEmail: z.string().email("Invalid email"),
    fromName: z.string().min(1, "Name is required"),
  });

  type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTicketFormValues>({
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
      const response: any = await api.getTickets(filters);
      setTickets(response.tickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      await api.createTicket(data);
      setCreateDialogOpen(false);
      reset();
      fetchTickets();
    } catch (error) {
      alert("Failed to create ticket");
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

  return (
    <Layout title="Tickets">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Status</option>
              {Object.values(TicketStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Categories</option>
              {Object.values(TicketCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                </option>
              ))}
            </select>

            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />

            <Button onClick={() => setCreateDialogOpen(true)}>
              + New Ticket
            </Button>
          </div>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            Loading...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                      Category
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
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
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
                        {ticket.category}
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
        )}
      </div>

      {/* Create Ticket Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Create New Ticket"
      >
        <form
          noValidate
          onSubmit={handleSubmit(handleCreateTicket)}
          className="space-y-4"
        >
          <Input
            label="Subject"
            required
            placeholder="Ticket subject"
            {...register("subject")}
            error={errors.subject?.message}
          />
          <Textarea
            label="Description"
            required
            placeholder="Ticket description"
            rows={4}
            {...register("body")}
            error={errors.body?.message}
          />
          <Input
            label="From Name"
            required
            placeholder="Customer name"
            {...register("fromName")}
            error={errors.fromName?.message}
          />
          <Input
            label="From Email"
            type="email"
            required
            placeholder="customer@example.com"
            {...register("fromEmail")}
            error={errors.fromEmail?.message}
          />
          <Button type="submit" className="w-full">
            Create Ticket
          </Button>
        </form>
      </Dialog>
    </Layout>
  );
};

export default TicketsPage;
