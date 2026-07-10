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
import Select from "../components/Select";
import { TicketStatus, TicketCategory } from "../types";
import { Plus, Trash2, AlertTriangle, CheckCircle2, X } from "lucide-react";
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
        header: "Assigned",
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
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const ticket = info.row.original as any;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTicketToDelete(ticket);
                setDeleteDialogOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
              aria-label="Delete ticket"
            >
              <Trash2 size={16} />
            </button>
          );
        },
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

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteTicket(ticketToDelete.id);
      setToast({ type: "success", message: `Ticket #${ticketToDelete.id.slice(-6).toUpperCase()} deleted successfully.` });
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
      fetchTickets(true);
    } catch (error: any) {
      console.error("Failed to delete ticket:", error);
      setToast({ type: "error", message: error.message || "Failed to delete ticket." });
    } finally {
      setIsDeleting(false);
    }
  };

  const statusFilterValue =
    (columnFilters.find((f) => f.id === "status")?.value as string) ?? "";
  const categoryFilterValue =
    (columnFilters.find((f) => f.id === "category")?.value as string) ?? "";

  const updateColumnFilter = (id: "status" | "category", value: string) => {
    setColumnFilters((prev) =>
      value
        ? [...prev.filter((f) => f.id !== id), { id, value }]
        : prev.filter((f) => f.id !== id),
    );
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_200px_auto] xl:items-center">
            <Input
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            />
            <Select
              value={statusFilterValue}
              onChange={(e) => updateColumnFilter("status", e.target.value)}
              placeholder="All Statuses"
              aria-label="Filter by status"
              options={Object.values(TicketStatus).map((status) => ({
                value: status,
                label: formatStatus(status),
              }))}
            />
            <Select
              value={categoryFilterValue}
              onChange={(e) => updateColumnFilter("category", e.target.value)}
              placeholder="All Categories"
              aria-label="Filter by category"
              options={Object.values(TicketCategory).map((cat) => ({
                value: cat,
                label: formatCategory(cat),
              }))}
            />
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="w-full justify-center xl:w-auto xl:whitespace-nowrap"
            >
              <Plus size={18} /> New Ticket
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
            Loading...
          </div>
        ) : (
          <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px]">
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
              <div className="flex flex-col gap-4 px-6 py-4 border border-slate-200 bg-white rounded-xl sm:flex-row sm:items-center sm:justify-between">
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
                  <span className="text-sm text-slate-600 whitespace-nowrap">
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Ticket?"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="text-xs font-semibold leading-relaxed">
              Warning: This action is permanent and cannot be undone. All replies associated with this ticket will be deleted immediately.
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-900">"{ticketToDelete?.subject}"</span>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 border border-red-700 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white rounded-xl border shadow-lg border-slate-200 animate-fade-in">
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm font-semibold text-slate-800">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </Layout>
  );
};

export default TicketsPage;
