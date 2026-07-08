import React from "react";
import { Edit, Trash2, Shield, User } from "lucide-react";
import Button from "./Button";
import Badge from "./Badge";
import { formatDate } from "../lib/utils";
import { UserRole } from "../types";

interface UsersTableProps {
  loading: boolean;
  users: any[];
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  loading,
  users,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
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
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="h-6 w-16 bg-slate-200 rounded-full" />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <div className="inline-block h-8 w-8 bg-slate-100 rounded-lg" />
                    <div className="inline-block h-8 w-8 bg-slate-100 rounded-lg" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
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
                    <Badge variant={user.role === UserRole.ADMIN ? "open" : "default"}>
                      <span className="flex items-center gap-1">
                        {user.role === UserRole.ADMIN ? <Shield size={12} /> : <User size={12} />}
                        {user.role}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="inline-flex text-blue-600 hover:text-blue-800"
                      aria-label={`Edit ${user.name}`}
                    >
                      <Edit size={16} />
                    </Button>
                    {user.role !== UserRole.ADMIN && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(user)}
                        className="inline-flex text-red-600 hover:text-red-800"
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
