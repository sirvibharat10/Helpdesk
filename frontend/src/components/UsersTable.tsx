import React from "react";
import { Edit2, Trash2, Shield, User, Clock } from "lucide-react";
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
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(4)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100" />
                      <div className="space-y-2">
                        <div className="h-3.5 w-24 bg-slate-100 rounded" />
                        <div className="h-3 w-36 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="h-6 w-16 bg-slate-100 rounded-lg" />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="h-4 w-20 bg-slate-100 rounded" />
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="inline-block h-8 w-16 bg-slate-50 rounded-lg" />
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User Details</th>
              <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace Role</th>
              <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                  No users found in organization directory.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Name with initials avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 tracking-tight">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Badge Role style */}
                  <td className="px-6 py-4 text-sm">
                    <Badge variant={user.role === UserRole.ADMIN ? "open" : "default"}>
                      <span className="flex items-center gap-1.5 font-semibold text-xs tracking-tight">
                        {user.role === UserRole.ADMIN ? (
                          <Shield size={12} className="text-blue-500 fill-blue-50" />
                        ) : (
                          <User size={12} className="text-slate-500" />
                        )}
                        {user.role}
                      </span>
                    </Badge>
                  </td>

                  {/* Date Created */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock size={12} />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>

                  {/* Modern action controls */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer active:scale-90"
                        aria-label={`Edit profile of ${user.name}`}
                      >
                        <Edit2 size={15} />
                      </button>
                      
                      {user.role !== UserRole.ADMIN && (
                        <button
                          onClick={() => onDelete(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer active:scale-90"
                          aria-label={`Delete account of ${user.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
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
