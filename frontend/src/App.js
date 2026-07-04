import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import UsersPage from "./pages/UsersPage";
import EmailSetupPage from "./pages/EmailSetupPage";
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isLoggedIn, user } = useAuth();
    if (!isLoggedIn) {
        return _jsx(Navigate, { to: "/login" });
    }
    if (adminOnly && user?.role !== "ADMIN") {
        return _jsx(Navigate, { to: "/dashboard" });
    }
    return _jsx(_Fragment, { children: children });
};
function App() {
    const { isLoggedIn } = useAuth();
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: isLoggedIn ? _jsx(Navigate, { to: "/dashboard" }) : _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: isLoggedIn ? _jsx(Navigate, { to: "/dashboard" }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/tickets", element: _jsx(ProtectedRoute, { children: _jsx(TicketsPage, {}) }) }), _jsx(Route, { path: "/tickets/:id", element: _jsx(ProtectedRoute, { children: _jsx(TicketDetailPage, {}) }) }), _jsx(Route, { path: "/users", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(UsersPage, {}) }) }), _jsx(Route, { path: "/email-setup", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(EmailSetupPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/" }) })] }) }));
}
export default App;
