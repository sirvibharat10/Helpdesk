import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Layout from "../components/Layout";
const EmailSetupPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchSettings();
    }, []);
    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await api.getSettings();
            setSettings(data);
        }
        catch (error) {
            console.error("Failed to fetch settings:", error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx(Layout, { title: "Email Setup", children: _jsx("div", { children: "Loading..." }) }));
    }
    return (_jsx(Layout, { title: "Email Setup", children: _jsxs("div", { className: "max-w-2xl space-y-6", children: [_jsxs("div", { className: "bg-blue-50 p-6 rounded-xl border border-blue-200", children: [_jsx("h2", { className: "text-lg font-semibold text-blue-900 mb-4", children: "Gmail IMAP Setup" }), _jsxs("div", { className: "space-y-4 text-sm text-blue-900", children: [_jsx("p", { children: "To enable automatic email polling, you need to:" }), _jsxs("ol", { className: "list-decimal list-inside space-y-2", children: [_jsx("li", { children: "Go to your Google Account settings" }), _jsx("li", { children: "Enable 2-Step Verification" }), _jsx("li", { children: "Generate an App Password for your email client" }), _jsx("li", { children: "Use the App Password in the GMAIL_APP_PASSWORD environment variable" })] }), _jsx("p", { className: "mt-4", children: _jsx("strong", { children: "Current Configuration:" }) }), _jsxs("div", { className: "bg-white p-3 rounded mt-2 space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Gmail User:" }), _jsx("span", { className: "ml-2 text-slate-600", children: settings?.gmail_user })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Support Email:" }), _jsx("span", { className: "ml-2 text-slate-600", children: settings?.support_email })] })] })] })] }), _jsxs("div", { className: "bg-green-50 p-6 rounded-xl border border-green-200", children: [_jsx("h2", { className: "text-lg font-semibold text-green-900 mb-4", children: "API Keys Status" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Gemini API Key:" }), _jsx("span", { className: settings?.gemini_api_key === "Not set"
                                                ? "text-red-600"
                                                : "text-green-600", children: settings?.gemini_api_key === "Not set"
                                                ? "❌ Not configured"
                                                : "✅ Configured" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Resend API Key:" }), _jsx("span", { className: settings?.resend_api_key === "Not set"
                                                ? "text-red-600"
                                                : "text-green-600", children: settings?.resend_api_key === "Not set"
                                                ? "❌ Not configured"
                                                : "✅ Configured" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Database:" }), _jsx("span", { className: settings?.database_url === "Not set"
                                                ? "text-red-600"
                                                : "text-green-600", children: settings?.database_url === "Not set"
                                                ? "❌ Not configured"
                                                : "✅ Configured" })] })] })] }), _jsxs("div", { className: "bg-yellow-50 p-6 rounded-xl border border-yellow-200", children: [_jsx("h2", { className: "text-lg font-semibold text-yellow-900 mb-4", children: "Email Polling" }), _jsx("p", { className: "text-sm text-yellow-900 mb-3", children: "The system polls your Gmail inbox every 30 seconds to check for new emails and automatically create support tickets." }), _jsxs("ul", { className: "list-disc list-inside text-sm text-yellow-900 space-y-1", children: [_jsx("li", { children: "Only processes emails received after server start" }), _jsx("li", { children: "Auto-classifies emails using AI" }), _jsx("li", { children: "Marks processed emails as read" })] })] })] }) }));
};
export default EmailSetupPage;
