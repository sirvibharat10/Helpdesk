import React, { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, isAdmin } from "../lib/auth";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-blue-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-blue-800">
          <Link to="/">
            <h1 className={`font-bold text-xl hover:text-blue-200 transition-colors ${!sidebarOpen && "text-center"}`}>
              {sidebarOpen ? "🚀 SahaYak AI" : "S"}
            </h1>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            icon={LayoutDashboard}
            label="Dashboard"
            href="/dashboard"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            icon={Ticket}
            label="Tickets"
            href="/tickets"
            sidebarOpen={sidebarOpen}
          />
          {isAdmin() && (
            <>
              <NavLink
                icon={Users}
                label="Users"
                href="/users"
                sidebarOpen={sidebarOpen}
              />
              <NavLink
                icon={Settings}
                label="Email Setup"
                href="/email-setup"
                sidebarOpen={sidebarOpen}
              />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 hover:bg-blue-800 rounded transition-colors"
          >
            <Menu size={20} className="mx-auto" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </div>
    </div>
  );
};

interface NavLinkProps {
  icon: React.FC<any>;
  label: string;
  href: string;
  sidebarOpen: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  icon: Icon,
  label,
  href,
  sidebarOpen,
}) => {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 p-3 hover:bg-blue-800 rounded-lg transition-colors group"
    >
      <Icon size={20} />
      <span className={`transition-opacity ${!sidebarOpen && "opacity-0 w-0"}`}>
        {label}
      </span>
    </Link>
  );
};

export default Layout;
