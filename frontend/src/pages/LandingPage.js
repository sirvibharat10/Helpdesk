import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { Menu, X } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Dialog from "../components/Dialog";
const LandingPage = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [demoDialogOpen, setDemoDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const demoFormSchema = z.object({
        name: z.string().min(1, "Name is required"),
        contactNumber: z.string().min(6, "Contact number is required"),
        email: z.string().email("Invalid email"),
        organization: z.string().min(1, "Organization is required"),
        interestedIn: z.enum(["FREE_DEMO", "PRODUCT_TOUR", "CUSTOM_ONBOARDING"]),
    });
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        resolver: zodResolver(demoFormSchema),
        defaultValues: {
            name: "",
            contactNumber: "",
            email: "",
            organization: "",
            interestedIn: "FREE_DEMO",
        },
    });
    const handleDemoSubmit = async (data) => {
        setSubmitting(true);
        try {
            await api.sendDemoInquiry(data);
            alert("Demo inquiry sent! We will contact you soon.");
            setDemoDialogOpen(false);
            reset();
        }
        catch (error) {
            alert("Failed to send inquiry. Please try again.");
        }
        finally {
            setSubmitting(false);
        }
    };
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth" });
        setMenuOpen(false);
    };
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("nav", { className: "sticky top-0 bg-white border-b border-slate-200 z-50", children: [_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "text-2xl font-bold text-blue-900", children: "\uD83D\uDE80 SahaYak AI" }) }), _jsxs("div", { className: "hidden md:flex items-center gap-8", children: [_jsx("button", { onClick: () => scrollToSection("home"), className: "text-slate-600 hover:text-slate-900", children: "Home" }), _jsx("button", { onClick: () => scrollToSection("about"), className: "text-slate-600 hover:text-slate-900", children: "About" }), _jsx("button", { onClick: () => scrollToSection("pricing"), className: "text-slate-600 hover:text-slate-900", children: "Pricing" }), _jsx("button", { onClick: () => scrollToSection("contact"), className: "text-slate-600 hover:text-slate-900", children: "Contact Us" })] }), _jsx("div", { className: "hidden md:flex items-center gap-4", children: _jsx(Button, { variant: "ghost", onClick: () => navigate("/login"), children: "Login" }) }), _jsx("button", { className: "md:hidden", onClick: () => setMenuOpen(!menuOpen), children: menuOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) })] }), menuOpen && (_jsx("div", { className: "md:hidden border-t border-slate-200", children: _jsxs("div", { className: "px-4 py-4 space-y-4", children: [_jsx("button", { onClick: () => scrollToSection("home"), className: "block w-full text-left text-slate-600", children: "Home" }), _jsx("button", { onClick: () => scrollToSection("about"), className: "block w-full text-left text-slate-600", children: "About" }), _jsx("button", { onClick: () => scrollToSection("pricing"), className: "block w-full text-left text-slate-600", children: "Pricing" }), _jsx(Button, { onClick: () => navigate("/login"), className: "w-full", children: "Login" })] }) }))] }), _jsx("section", { id: "home", className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-12 items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-5xl font-bold text-slate-900 mb-6", children: "Meet the Last CRM You Will Ever Need" }), _jsx("p", { className: "text-xl text-slate-600 mb-8", children: "Powerful AI-driven helpdesk and CRM solution designed to transform your customer support operations." }), _jsx(Button, { onClick: () => setDemoDialogOpen(true), className: "text-lg px-8 py-4", children: "Let's Talk Growth" })] }), _jsx("div", { className: "bg-gradient-to-br from-blue-100 to-slate-100 h-96 rounded-2xl flex items-center justify-center", children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDC68\u200D\uD83D\uDCBC" }) })] }) }), _jsx("section", { id: "features", className: "bg-slate-50 py-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-12", children: "Why Choose SahaYak AI?" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [
                                { title: "Ticket Management", icon: "🎫" },
                                { title: "Team Collaboration", icon: "👥" },
                                { title: "AI-Powered Assistance", icon: "🤖" },
                                { title: "Analytics & Reports", icon: "📊" },
                            ].map((feature, i) => (_jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-slate-200", children: [_jsx("div", { className: "text-4xl mb-4", children: feature.icon }), _jsx("h3", { className: "text-lg font-semibold text-slate-900", children: feature.title })] }, i))) })] }) }), _jsx("section", { id: "about", className: "py-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-12", children: "Why We're Different" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                                "Faster Resolution",
                                "Centralized Communication",
                                "Full Audit Trail",
                                "Role-Based Access",
                                "AI-Assisted Routing",
                                "Easy Onboarding",
                            ].map((advantage, i) => (_jsx("div", { className: "p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow", children: _jsx("h3", { className: "font-semibold text-slate-900", children: advantage }) }, i))) })] }) }), _jsx("section", { id: "pricing", className: "bg-slate-50 py-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-12", children: "Simple, Transparent Pricing" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
                                { name: "Monthly", price: "₹1,499", period: "/mo" },
                                {
                                    name: "Yearly",
                                    price: "₹1,199",
                                    period: "/mo",
                                    badge: "Save 20%",
                                },
                            ].map((plan, i) => (_jsxs("div", { className: "bg-white p-8 rounded-xl border border-slate-200", children: [plan.badge && (_jsx("div", { className: "inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4", children: plan.badge })), _jsx("h3", { className: "text-2xl font-bold text-slate-900 mb-2", children: plan.name }), _jsxs("div", { className: "text-4xl font-bold text-blue-900 mb-6", children: [plan.price, _jsx("span", { className: "text-lg text-slate-600", children: plan.period })] }), _jsx(Button, { onClick: () => setDemoDialogOpen(true), className: "w-full", children: "Get Started" })] }, i))) })] }) }), _jsx("section", { className: "bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center px-4", children: [_jsx("h2", { className: "text-4xl font-bold mb-6", children: "Book your FREE Demo Now" }), _jsx(Button, { onClick: () => setDemoDialogOpen(true), variant: "secondary", className: "text-lg px-8 py-4", children: "Schedule Demo" })] }) }), _jsxs("section", { id: "contact", className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-12", children: "Get in Touch" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl border border-slate-200", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: "Founder" }), _jsx("p", { className: "text-slate-600", children: "Sahay Yadav" }), _jsx("p", { className: "text-slate-600", children: "CEO & Founder" })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl border border-slate-200", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: "Contact" }), _jsx("p", { className: "text-slate-600", children: "\uD83D\uDCDE +91 9876543210" }), _jsx("p", { className: "text-slate-600", children: "\uD83D\uDCE7 contact@sahayak.ai" })] })] })] }), _jsx("footer", { className: "bg-slate-900 text-white py-8", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 text-center", children: _jsx("p", { className: "text-slate-400", children: "\u00A9 2024 SahaYak AI. All rights reserved." }) }) }), _jsx(Dialog, { open: demoDialogOpen, onOpenChange: setDemoDialogOpen, title: "Book Your Free Demo", children: _jsxs("form", { onSubmit: handleSubmit(handleDemoSubmit), className: "space-y-4", children: [_jsx(Input, { label: "Name", required: true, placeholder: "Your name", ...register("name"), error: errors.name?.message }), _jsx(Input, { label: "Contact Number", required: true, placeholder: "Your phone number", ...register("contactNumber"), error: errors.contactNumber?.message }), _jsx(Input, { label: "Email", type: "email", required: true, placeholder: "Your email", ...register("email"), error: errors.email?.message }), _jsx(Input, { label: "Organization", required: true, placeholder: "Your organization", ...register("organization"), error: errors.organization?.message }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Interested In" }), _jsxs("select", { ...register("interestedIn"), className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900", children: [_jsx("option", { value: "FREE_DEMO", children: "Free Demo" }), _jsx("option", { value: "PRODUCT_TOUR", children: "Product Tour" }), _jsx("option", { value: "CUSTOM_ONBOARDING", children: "Custom Onboarding" })] }), errors.interestedIn && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.interestedIn.message }))] }), _jsx(Button, { type: "submit", loading: submitting, className: "w-full", children: "Send Inquiry" })] }) })] }));
};
export default LandingPage;
