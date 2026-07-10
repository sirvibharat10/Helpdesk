import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Shield, User, Key, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Input from "../components/Input";
import Dialog from "../components/Dialog";
import UsersTable from "../components/UsersTable";
import Select from "../components/Select";
import { UserRole } from "../types";
import { createUserSchema } from "core";

const updateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8, "Password must be at least 8 characters").or(z.literal("")),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modals state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Fetch all users
  const {
    data: users = [],
    isLoading: loading,
    error,
  } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: () => api.getUsers() as Promise<any[]>,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (data: any) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreateDialogOpen(false);
      resetCreate();
    },
  });

  const editUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditDialogOpen(false);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteDialogOpen(false);
    },
  });

  const actionLoading =
    createUserMutation.isPending ||
    editUserMutation.isPending ||
    deleteUserMutation.isPending;

  // Forms setup
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.AGENT,
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    watch: watchEdit,
    formState: { errors: editErrors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
  });

  const editRoleValue = watchEdit("role");

  const handleCreateUser = (data: CreateUserFormValues) => {
    createUserMutation.mutate(data);
  };

  const openEditModal = (user: any) => {
    editUserMutation.reset();
    setSelectedUser(user);
    resetEdit({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setEditDialogOpen(true);
  };

  const handleEditUser = (data: UpdateUserFormValues) => {
    if (!selectedUser) return;
    const payload: any = {
      name: data.name,
      email: data.email,
      role: data.role,
    };
    if (data.password && data.password.trim().length >= 6) {
      payload.password = data.password;
    }
    editUserMutation.mutate({ id: selectedUser.id, payload });
  };

  const openDeleteModal = (user: any) => {
    deleteUserMutation.reset();
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
  };

  return (
    <Layout title="Users">
      <div className="space-y-8 animate-fade-in">
        {/* Top bar (Redesigned Header) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-sky-50 via-blue-50/40 to-white p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/5 via-transparent to-transparent opacity-70"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold text-slate-950 tracking-tight">Organization Directory</h3>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Create, manage, and configure access roles or system credentials for support agents and workspace administrators.
            </p>
          </div>
          <button
            onClick={() => {
              createUserMutation.reset();
              resetCreate();
              setCreateDialogOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 z-10 cursor-pointer"
          >
            <UserPlus size={16} />
            Add New User
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm">
            {error instanceof Error ? error.message : "Failed to load users"}
          </div>
        )}

        {/* Users Table */}
        <UsersTable
          loading={loading}
          users={users}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {/* Add User Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Add New User"
      >
        <form noValidate onSubmit={handleSubmitCreate(handleCreateUser)} className="space-y-4">
          {createUserMutation.error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 text-sm">
              {createUserMutation.error instanceof Error ? createUserMutation.error.message : "An error occurred"}
            </div>
          )}
          <Input
            label="Full Name"
            required
            placeholder="John Doe"
            {...registerCreate("name")}
            error={createErrors.name?.message}
          />
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="john@example.com"
            {...registerCreate("email")}
            error={createErrors.email?.message}
          />
          <Input
            label="Temporary Password"
            type="password"
            required
            placeholder="••••••••"
            {...registerCreate("password")}
            error={createErrors.password?.message}
          />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateDialogOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-750 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              disabled={actionLoading}
            >
              {actionLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit User Profile"
      >
        {selectedUser && (
          <form noValidate onSubmit={handleSubmitEdit(handleEditUser)} className="space-y-4">
            {editUserMutation.error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 text-sm">
                {editUserMutation.error instanceof Error ? editUserMutation.error.message : "An error occurred"}
              </div>
            )}
            <Input
              label="Full Name"
              required
              placeholder="John Doe"
              {...registerEdit("name")}
              error={editErrors.name?.message}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="john@example.com"
              {...registerEdit("email")}
              error={editErrors.email?.message}
            />
            
            <Select
              label="Workspace Role"
              options={[
                { value: UserRole.AGENT, label: "Agent" },
                { value: UserRole.ADMIN, label: "Admin" },
              ]}
              value={editRoleValue}
              {...registerEdit("role")}
              error={editErrors.role?.message}
            />

            <Input
              label="Update Password (leave blank to keep current)"
              type="password"
              placeholder="••••••••"
              {...registerEdit("password")}
              error={editErrors.password?.message}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditDialogOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-750 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
      >
        {selectedUser && (
          <div className="space-y-4">
            {deleteUserMutation.error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 text-sm">
                {deleteUserMutation.error instanceof Error ? deleteUserMutation.error.message : "An error occurred"}
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div className="text-xs font-semibold leading-relaxed">
                Warning: This action is permanent and cannot be undone. All database records associated with this profile will be unassigned.
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete user <strong className="text-slate-900">{selectedUser.name}</strong> ({selectedUser.email})?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-750 border border-red-700 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                disabled={actionLoading}
                onClick={handleDeleteUser}
              >
                {actionLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </Layout>
  );
};

export default UsersPage;
