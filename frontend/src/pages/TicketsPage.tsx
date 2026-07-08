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
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

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
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    if (sorting.length > 0) {
      const sortField = sorting[0].id;
      const sortOrderVal = sorting[0].desc ? "desc" : "asc";
      setFilters((prev) => ({
        ...prev,
        sortBy: sortField,
        sortOrder: sortOrderVal,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        sortBy: "createdAt",
        sortOrder: "desc",
      }));
    }
  }, [sorting]);

  // Sync columnFilters → filters (server-side)
  useEffect(() => {
    const statusFilter = columnFilters.find((f) => f.id === "status");
    const categoryFilter = columnFilters.find((f) => f.id === "category");
    setFilters((prev) => ({
      ...prev,
      status: (statusFilter?.value as string) ?? "",
      category: (categoryFilter?.value as string) ?? "",
    }));
  }, [columnFilters]);

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "subject",
        header: "Subject",
        cell: (info) => (
          <span className="font-medium text-blue-600">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "fromEmail",
        header: "From",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <Badge variant={getStatusBadgeVariant(val)}>
              {val}
            </Badge>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: (info) => {
          const val = info.getValue() as string;
          return val.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (info) => formatDate(info.getValue() as string),
      },
    ],
    []
  );

  const table = useReactTable({
    data: tickets,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  });

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
              value={(columnFilters.find((f) => f.id === "status")?.value as string) ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setColumnFilters((prev) =>
                  val
                    ? [...prev.filter((f) => f.id !== "status"), { id: "status", value: val }]
                    : prev.filter((f) => f.id !== "status")
                );
              }}
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
              value={(columnFilters.find((f) => f.id === "category")?.value as string) ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setColumnFilters((prev) =>
                  val
                    ? [...prev.filter((f) => f.id !== "category"), { id: "category", value: val }]
                    : prev.filter((f) => f.id !== "category")
                );
              }}
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
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const isSortable = ["subject", "fromEmail", "status", "category", "createdAt"].includes(header.id);
                        return (
                          <th
                            key={header.id}
                            onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                            className={`px-6 py-3 text-left text-sm font-semibold text-slate-900 ${isSortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                          >
                            <div className="flex items-center gap-1">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {isSortable && (
                                <span className="text-slate-400 text-xs">
                                  {{
                                    asc: " 🔼",
                                    desc: " 🔽",
                                  }[header.column.getIsSorted() as string] ?? " ⇅"}
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/tickets/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 text-sm text-slate-600"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
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
