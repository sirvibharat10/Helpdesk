import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
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
const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const createUserSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["AGENT", "ADMIN"]),
    });
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
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
            const response = await api.getUsers();
            setUsers(response);
        }
        catch (error) {
            console.error("Failed to fetch users:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateUser = async (data) => {
        try {
            await api.createUser(data);
            setCreateDialogOpen(false);
            reset();
            fetchUsers();
        }
        catch (error) {
            alert("Failed to create user");
        }
    };
    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure?"))
            return;
        try {
            await api.deleteUser(userId);
            fetchUsers();
        }
        catch (error) {
            alert("Failed to delete user");
        }
    };
    return (_jsxs(Layout, { title: "Users", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: () => setCreateDialogOpen(true), children: "+ Add User" }) }), loading ? (_jsx("div", { children: "Loading..." })) : (_jsx("div", { className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Role" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Created" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-200", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-slate-900", children: user.name }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: user.email }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${user.role === "ADMIN"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-blue-100 text-blue-800"}`, children: user.role }) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: formatDate(user.createdAt) }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx("button", { onClick: () => handleDeleteUser(user.id), className: "text-red-600 hover:text-red-800 p-2", children: _jsx(Trash2, { size: 18 }) }) })] }, user.id))) })] }) }) }))] }), _jsx(Dialog, { open: createDialogOpen, onOpenChange: setCreateDialogOpen, title: "Add New User", children: _jsxs("form", { onSubmit: handleSubmit(handleCreateUser), className: "space-y-4", children: [_jsx(Input, { label: "Name", required: true, placeholder: "Full name", ...register("name"), error: errors.name?.message }), _jsx(Input, { label: "Email", type: "email", required: true, placeholder: "user@example.com", ...register("email"), error: errors.email?.message }), _jsx(Input, { label: "Password", type: "password", required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", ...register("password"), error: errors.password?.message }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Role" }), _jsxs("select", { ...register("role"), className: "w-full px-4 py-2 border border-slate-300 rounded-lg", children: [_jsx("option", { value: "AGENT", children: "Agent" }), _jsx("option", { value: "ADMIN", children: "Admin" })] }), errors.role && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.role.message }))] }), _jsx(Button, { type: "submit", className: "w-full", children: "Create User" })] }) })] }));
};
export default UsersPage;
