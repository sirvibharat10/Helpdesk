import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import Button from "../components/Button";
import Input from "../components/Input";
const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password is required"),
});
const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const handleLogin = async (data) => {
        setLoading(true);
        setError("");
        try {
            const result = await api.login(data.email, data.password);
            setAuth(result.token, result.user);
            navigate("/dashboard");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        }
        finally {
            setLoading(false);
        }
    };
    const fillCredentials = (role) => {
        if (role === "ADMIN") {
            reset({ email: "admin@sahayak.ai", password: "admin123" });
        }
        else {
            reset({ email: "agent@sahayak.ai", password: "agent123" });
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex", children: [_jsxs("div", { className: "hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-800 text-white flex-col justify-between p-12", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold mb-8", children: "\uD83D\uDE80 SahaYak AI" }), _jsx("h2", { className: "text-3xl font-bold mb-6", children: "Welcome Back" }), _jsxs("ul", { className: "space-y-4 text-lg", children: [_jsx("li", { children: "\u2713 AI-Powered Ticket Management" }), _jsx("li", { children: "\u2713 Intelligent Routing & Classification" }), _jsx("li", { children: "\u2713 Real-time Collaboration" }), _jsx("li", { children: "\u2713 Advanced Analytics" })] })] }), _jsxs("div", { className: "flex gap-8 justify-center", children: [_jsx("div", { className: "w-12 h-12 bg-blue-700 rounded-full" }), _jsx("div", { className: "w-12 h-12 bg-blue-600 rounded-full" }), _jsx("div", { className: "w-12 h-12 bg-blue-500 rounded-full" })] })] }), _jsx("div", { className: "w-full lg:w-1/2 flex items-center justify-center p-8", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 mb-2", children: "Sign In" }), _jsx("p", { className: "text-slate-600", children: "Access your SahaYak AI dashboard" })] }), _jsxs("form", { onSubmit: handleSubmit(handleLogin), className: "space-y-6", children: [error && (_jsx("div", { className: "p-4 bg-red-100 text-red-700 rounded-lg text-sm", children: error })), _jsx(Input, { label: "Email", type: "email", placeholder: "your@email.com", ...register("email"), error: errors.email?.message }), _jsx(Input, { label: "Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", ...register("password"), error: errors.password?.message }), _jsx(Button, { type: "submit", loading: loading, className: "w-full", children: "Sign In" })] }), _jsxs("div", { className: "mt-8 pt-8 border-t border-slate-200", children: [_jsx("p", { className: "text-sm text-slate-600 mb-4", children: "Demo Credentials" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { onClick: () => fillCredentials("ADMIN"), className: "p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors", children: [_jsx("p", { className: "font-semibold text-slate-900", children: "Admin" }), _jsx("p", { className: "text-sm text-slate-600", children: "admin@sahayak.ai" }), _jsx("p", { className: "text-sm text-slate-600", children: "Pass: admin123" })] }), _jsxs("div", { onClick: () => fillCredentials("AGENT"), className: "p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors", children: [_jsx("p", { className: "font-semibold text-slate-900", children: "Agent" }), _jsx("p", { className: "text-sm text-slate-600", children: "agent@sahayak.ai" }), _jsx("p", { className: "text-sm text-slate-600", children: "Pass: agent123" })] })] })] })] }) })] }));
};
export default LoginPage;
