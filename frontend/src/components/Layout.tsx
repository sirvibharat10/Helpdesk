import React, { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Modern Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col text-slate-800`}
      >
        {/* Branding header */}
        <div className="h-[73px] flex items-center px-6 border-b border-slate-200/80">
          <Link to="/" className="w-full">
            <h1
              className={`font-extrabold text-xl text-slate-900 tracking-tight hover:text-blue-600 transition-colors ${
                !sidebarOpen && "text-center"
              }`}
            >
              {sidebarOpen ? "🚀 My HelpDesk" : "M"}
            </h1>
          </Link>
        </div>

        {/* Large Rounded Container below the logo */}
        <div className={`flex-1 flex flex-col space-y-1.5 overflow-y-auto bg-white border border-slate-200/60 rounded-2xl shadow-sm transition-all duration-300 ${
          sidebarOpen ? "m-4 p-3" : "m-2 p-1.5"
        }`}>
          <NavLink
            icon={LayoutDashboard}
            label="Dashboard"
            href="/dashboard"
            sidebarOpen={sidebarOpen}
            active={location.pathname === "/dashboard" || location.pathname === "/"}
          />
          <NavLink
            icon={Ticket}
            label="Tickets"
            href="/tickets"
            sidebarOpen={sidebarOpen}
            active={location.pathname.startsWith("/tickets")}
          />
          {isAdmin() && (
            <>
              <NavLink
                icon={Users}
                label="Users"
                href="/users"
                sidebarOpen={sidebarOpen}
                active={location.pathname.startsWith("/users")}
              />
              <NavLink
                icon={Settings}
                label="Email Setup"
                href="/email-setup"
                sidebarOpen={sidebarOpen}
                active={location.pathname.startsWith("/email-setup")}
              />
            </>
          )}
        </div>

        {/* Sidebar Toggle at the bottom */}
        <div className={`border-t border-slate-200/80 transition-all duration-300 ${sidebarOpen ? "p-4" : "p-2"}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-[73px] bg-white border-b border-slate-200/80 px-8 flex justify-between items-center shadow-sm shrink-0">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
              </div>
              <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer active:scale-95"
            >
              <LogOut size={14} />
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
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  icon: Icon,
  label,
  href,
  sidebarOpen,
  active,
}) => {
  return (
    <Link
      to={href}
      title={!sidebarOpen ? label : undefined}
      className={`flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
        sidebarOpen ? "justify-start gap-3 w-full" : "justify-center w-full"
      } ${
        active
          ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white font-semibold shadow-sm hover:shadow-md hover:shadow-blue-500/10"
          : "text-slate-600 hover:text-slate-900 hover:bg-sky-50/50"
      }`}
    >
      <Icon size={18} className={active ? "text-white" : "text-slate-500 group-hover:text-slate-800"} />
      {sidebarOpen && (
        <span className="text-sm tracking-tight transition-opacity duration-200">
          {label}
        </span>
      )}
    </Link>
  );
};

export default Layout;
