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
import { formatDate, formatStatus, formatCategory } from "../lib/utils";
import { TicketStatus, TicketCategory } from "../types";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from "@tanstack/react-table";

const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

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
    page: "1",
    limit: "10",
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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
    // Reset to first page on sort change
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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
    // Reset to first page on filter change
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters]);

  // Sync pagination → filters (server-side)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: String(pagination.pageIndex + 1),
      limit: String(pagination.pageSize),
    }));
  }, [pagination]);

  useEffect(() => {
    fetchTickets(true);
  }, [filters]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchTickets(false);
    }, 5000);
    return () => clearInterval(timer);
  }, [filters]);

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "subject",
        header: "Subject",
        cell: (info) => (
          <button
            className="link text-left"
            onClick={() => navigate(`/tickets/${(info.row.original as any).id}`)}
          >
            {info.getValue() as string}
          </button>
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
              {formatStatus(val)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: (info) => {
          const val = info.getValue() as string;
          return formatCategory(val);
        },
      },
      {
        id: "assignee",
        header: "Assignee",
        cell: (info) => {
          const ticket = info.row.original as any;
          return ticket.assignedTo ? (
            <span className="font-medium text-slate-700">{ticket.assignedTo.name}</span>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          );
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
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    rowCount: totalRows,
    getCoreRowModel: getCoreRowModel(),
  });

  const fetchTickets = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const response: any = await api.getTickets(filters);
      setTickets(response.tickets);
      setTotalRows(response.pagination?.total ?? 0);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      await api.createTicket(data);
      setCreateDialogOpen(false);
      reset();
      fetchTickets(true);
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
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Left Column: Tickets Table (main content) */}
        <div className="lg:col-span-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
              Loading...
            </div>
          ) : (
            <>
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
                          className="hover:bg-slate-50"
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

              {/* Pagination controls */}
              <div className="flex items-center justify-between px-6 py-4 border border-slate-200 bg-white rounded-xl">
                <span className="text-sm text-slate-500">
                  Showing{" "}
                  {totalRows === 0
                    ? 0
                    : pagination.pageIndex * pagination.pageSize + 1}
                  {" – "}
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows)}{" "}
                  of {totalRows} tickets
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    &larr; Previous
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Sidebar Filters */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <Button onClick={() => setCreateDialogOpen(true)} className="w-full">
              + New Ticket
            </Button>
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          {/* Status Filter Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Status</h3>
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Statuses</option>
              {Object.values(TicketStatus).map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Category</h3>
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Categories</option>
              {Object.values(TicketCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {formatCategory(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>
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
