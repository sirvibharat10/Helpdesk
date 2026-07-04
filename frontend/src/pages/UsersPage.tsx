import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Input from "../components/Input";
import Dialog from "../components/Dialog";
import { formatDate } from "../lib/utils";
import { Trash2 } from "lucide-react";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["AGENT", "ADMIN"]),
  });

  type CreateUserFormValues = z.infer<typeof createUserSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "AGENT",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: any = await api.getUsers();
      setUsers(response);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: CreateUserFormValues) => {
    try {
      await api.createUser(data);
      setCreateDialogOpen(false);
      reset();
      fetchUsers();
    } catch (error) {
      alert("Failed to create user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  return (
    <Layout title="Users">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setCreateDialogOpen(true)}>+ Add User</Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === "ADMIN"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create User Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Add New User"
      >
        <form
          noValidate
          onSubmit={handleSubmit(handleCreateUser)}
          className="space-y-4"
        >
          <Input
            label="Name"
            required
            placeholder="Full name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            required
            placeholder="user@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <select
              {...register("role")}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.role
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-transparent focus:ring-blue-900"
              }`}
            >
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Create User
          </Button>
        </form>
      </Dialog>
    </Layout>
  );
};

export default UsersPage;
