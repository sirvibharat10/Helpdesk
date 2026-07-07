import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit, Trash2, UserPlus, Shield, User, Mail, Key } from "lucide-react";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Input from "../components/Input";
import Dialog from "../components/Dialog";
import Badge from "../components/Badge";
import { formatDate } from "../lib/utils";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "AGENT"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "AGENT"]),
  password: z.string().min(6, "Password must be at least 6 characters").or(z.literal("")),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
      role: "AGENT",
      password: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: any = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: CreateUserFormValues) => {
    try {
      setActionLoading(true);
      await api.createUser(data);
      setCreateDialogOpen(false);
      resetCreate();
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    resetEdit({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setEditDialogOpen(true);
  };

  const handleEditUser = async (data: UpdateUserFormValues) => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      // Clean up the password if it's empty so it doesn't get updated
      const payload: any = {
        name: data.name,
        email: data.email,
        role: data.role,
      };
      if (data.password && data.password.trim().length >= 6) {
        payload.password = data.password;
      }
      await api.updateUser(selectedUser.id, payload);
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await api.deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout title="Users">
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
            <p className="text-sm text-slate-500">Create, manage, and configure access roles for organization users.</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
            <UserPlus size={18} />
            Add User
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-600 bg-white rounded-xl shadow-sm border border-slate-200">
            <span className="animate-spin mr-2">⏳</span> Loading users...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created At</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={user.role === "ADMIN" ? "open" : "default"}>
                            <span className="flex items-center gap-1">
                              {user.role === "ADMIN" ? <Shield size={12} /> : <User size={12} />}
                              {user.role}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4 text-sm text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="inline-flex text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(user)}
                            className="inline-flex text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Add New User"
      >
        <form noValidate onSubmit={handleSubmitCreate(handleCreateUser)} className="space-y-4">
          <Input
            label="Name"
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
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <select
              {...registerCreate("role")}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-900 transition-colors bg-white text-sm"
            >
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
            {createErrors.role?.message && (
              <p className="text-red-600 text-sm mt-1">{createErrors.role.message}</p>
            )}
          </div>
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••"
            {...registerCreate("password")}
            error={createErrors.password?.message}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading}>
              Create User
            </Button>
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
            <Input
              label="Name"
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
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select
                {...registerEdit("role")}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-900 transition-colors bg-white text-sm"
              >
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
              {editErrors.role?.message && (
                <p className="text-red-600 text-sm mt-1">{editErrors.role.message}</p>
              )}
            </div>
            <Input
              label="Password (leave blank to keep current)"
              type="password"
              placeholder="••••••"
              {...registerEdit("password")}
              error={editErrors.password?.message}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirm User Deletion"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">
              Are you sure you want to delete user <strong className="text-slate-900">{selectedUser.name}</strong> ({selectedUser.email})?
            </p>
            <p className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
              This action cannot be undone. Any tickets or replies assigned or written by this user will remain, but will no longer reference this user profile.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={actionLoading}
                onClick={handleDeleteUser}
              >
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Layout>
  );
};

export default UsersPage;

