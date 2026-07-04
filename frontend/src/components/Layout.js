import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, isAdmin } from "../lib/auth";
import { Menu, LogOut, LayoutDashboard, Ticket, Users, Settings, } from "lucide-react";
const Layout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    return (_jsxs("div", { className: "flex h-screen bg-slate-50", children: [_jsxs("div", { className: `${sidebarOpen ? "w-64" : "w-20"} bg-blue-900 text-white transition-all duration-300 flex flex-col`, children: [_jsx("div", { className: "p-6 border-b border-blue-800", children: _jsx("h1", { className: `font-bold text-xl ${!sidebarOpen && "text-center"}`, children: sidebarOpen ? "🚀 SahaYak AI" : "S" }) }), _jsxs("nav", { className: "flex-1 p-4 space-y-2", children: [_jsx(NavLink, { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", sidebarOpen: sidebarOpen }), _jsx(NavLink, { icon: Ticket, label: "Tickets", href: "/tickets", sidebarOpen: sidebarOpen }), isAdmin() && (_jsxs(_Fragment, { children: [_jsx(NavLink, { icon: Users, label: "Users", href: "/users", sidebarOpen: sidebarOpen }), _jsx(NavLink, { icon: Settings, label: "Email Setup", href: "/email-setup", sidebarOpen: sidebarOpen })] }))] }), _jsx("div", { className: "p-4 border-t border-blue-800", children: _jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "w-full p-2 hover:bg-blue-800 rounded transition-colors", children: _jsx(Menu, { size: 20, className: "mx-auto" }) }) })] }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900", children: title }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-slate-600", children: user?.name }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors", children: [_jsx(LogOut, { size: 18 }), "Logout"] })] })] }), _jsx("div", { className: "flex-1 overflow-auto p-8", children: children })] })] }));
};
const NavLink = ({ icon: Icon, label, href, sidebarOpen, }) => {
    return (_jsxs(Link, { to: href, className: "flex items-center gap-3 p-3 hover:bg-blue-800 rounded-lg transition-colors group", children: [_jsx(Icon, { size: 20 }), _jsx("span", { className: `transition-opacity ${!sidebarOpen && "opacity-0 w-0"}`, children: label })] }));
};
export default Layout;
