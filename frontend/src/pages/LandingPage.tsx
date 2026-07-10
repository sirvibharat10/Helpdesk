import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Bot,
  Zap,
  BarChart3,
  Users,
  Mail,
  Shield,
  MessageSquare,
  Sparkles,
  Inbox,
  CheckCircle,
  Clock,
  HelpCircle,
  Phone,
} from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Dialog from "../components/Dialog";
import Select from "../components/Select";

const LandingPage: React.FC = () => {
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

  type DemoFormValues = z.infer<typeof demoFormSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      name: "",
      contactNumber: "",
      email: "",
      organization: "",
      interestedIn: "FREE_DEMO",
    },
  });

  const interestedInValue = watch("interestedIn");

  const handleDemoSubmit = async (data: DemoFormValues) => {
    setSubmitting(true);
    try {
      await api.sendDemoInquiry(data);
      alert("Demo inquiry sent! We will contact you soon.");
      setDemoDialogOpen(false);
      reset();
    } catch (error) {
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-800">
      {/* Sticky Header Navbar */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <span className="p-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg text-white">🚀</span>
              My HelpDesk
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection("workflow")}
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Plans
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => setDemoDialogOpen(true)}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer active:scale-95"
            >
              Book Free Demo
            </button>
          </div>

          <button
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="px-6 py-4 space-y-3.5">
              <button
                onClick={() => scrollToSection("home")}
                className="block w-full text-left text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Capabilities
              </button>
              <button
                onClick={() => scrollToSection("workflow")}
                className="block w-full text-left text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-left text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Plans
              </button>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-2.5 text-center text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setDemoDialogOpen(true)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-blue-600 rounded-xl"
                >
                  Book Free Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/10 to-sky-300/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100/60 shadow-sm">
            <Sparkles size={12} className="animate-pulse" />
            Empowered by Gemini AI Co-Pilot
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-none">
            Automate Customer Support <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              In Real-Time
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl leading-relaxed">
            My HelpDesk polls incoming mail, classifies topics, references your knowledge base, and auto-resolves tickets instantly. Empower agents with draft suggestions and smart analytics.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <button
              onClick={() => setDemoDialogOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/15 active:scale-95 transition-all cursor-pointer"
            >
              Start Free Trial
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-2xl text-sm font-bold transition-all cursor-pointer active:scale-95"
            >
              Explore Capabilities
            </button>
          </div>
        </div>

        {/* Dashboard Preview Section */}
        <div className="mt-16 md:mt-24 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xl relative z-10 animate-fade-in group">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/5 via-blue-500/5 to-purple-600/5 rounded-2xl pointer-events-none group-hover:scale-98 transition-transform duration-500"></div>
          <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex flex-col">
            {/* Window control dots bar */}
            <div className="bg-slate-100 px-4 py-3 flex gap-1.5 border-b border-slate-200/50">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            {/* Visual Preview Content */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Tickets</span>
                  <span className="text-2xl font-extrabold text-slate-900 mt-2">128</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Open Queue</span>
                  <span className="text-2xl font-extrabold text-slate-900 mt-2">12</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Auto-Resolved</span>
                  <span className="text-2xl font-extrabold text-emerald-600 mt-2">96</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Success Rate</span>
                  <span className="text-2xl font-extrabold text-blue-600 mt-2">75%</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Inbox Agent Feed</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    AI Online
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-slate-700">Refund request for order #1092</span>
                    <span className="font-bold text-emerald-600">RESOLVED BY AI</span>
                  </div>
                  <div className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg opacity-80">
                    <span className="font-semibold text-slate-700">Unable to log in to my portal</span>
                    <span className="font-bold text-blue-600">OPEN - ASSIGNED TO AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="bg-white py-20 md:py-28 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Full Suite Capabilities</h2>
            <p className="text-sm text-slate-500">
              Everything your support team needs to keep queues clean and satisfaction metrics high.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "IMAP Email Poller",
                desc: "Hooks up to your inbox and checks for unread client messages automatically every minute.",
                icon: Mail,
                color: "text-blue-600 bg-blue-50 border-blue-100",
              },
              {
                title: "Gemini Auto-Resolution",
                desc: "Classifies ticket topics and sends verified knowledge base replies to clients instantly.",
                icon: Bot,
                color: "text-emerald-600 bg-emerald-50 border-emerald-100",
              },
              {
                title: "AI Response Drafting",
                desc: "Drafts replies dynamically, allowing agents to polish content using AI styling tools.",
                icon: Sparkles,
                color: "text-violet-600 bg-violet-50 border-violet-100",
              },
              {
                title: "SaaS Workspace Trends",
                desc: "Full metrics suite capturing daily volume, average resolution times, and success stats.",
                icon: BarChart3,
                color: "text-sky-600 bg-sky-50 border-sky-100",
              },
              {
                title: "Secure Access Roles",
                desc: "Provides strict workspace separation using built-in administrator and support agent roles.",
                icon: Shield,
                color: "text-rose-600 bg-rose-50 border-rose-100",
              },
              {
                title: "Settings Simulator",
                desc: "Built-in simulation features for manual polling, mock ticket injection, and inbox testing.",
                icon: Zap,
                color: "text-amber-600 bg-amber-50 border-amber-100",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/70 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className={`p-2.5 w-fit rounded-xl ${feature.color} border transition-transform duration-300 group-hover:scale-110 mb-4`}>
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">{feature.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Automation Workflow Section */}
      <section id="workflow" className="py-20 md:py-28 bg-slate-50/30 overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">AI Co-Pilot Workflow</h2>
            <p className="text-sm text-slate-500">
              How My HelpDesk converts unread customer emails into resolved answers automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              {
                step: "01",
                title: "Fetch Incoming Mail",
                desc: "Poller searches your Gmail via IMAP for UNSEEN customer support messages received within 24h.",
                icon: Inbox,
              },
              {
                step: "02",
                title: "Analyze & Classify",
                desc: "Gemini classifies the issue topic and attempts to match the query with the knowledge-base.",
                icon: Bot,
              },
              {
                step: "03",
                title: "Send & Resolve",
                desc: "If match confidence is high, AI replies instantly to the client via SMTP and resolves the ticket.",
                icon: CheckCircle,
              },
            ].map((wf, idx) => {
              const Icon = wf.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-extrabold text-slate-100 tracking-tighter">{wf.step}</span>
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                      <Icon size={16} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1.5">{wf.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{wf.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-white border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Flexible SaaS Pricing</h2>
            <p className="text-sm text-slate-500">
              Pick the tier that fits your incoming support ticket volume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: "Monthly Billing",
                price: "₹1,499",
                period: "/month",
                desc: "Billed month-to-month. Cancel anytime.",
                features: ["Unlimited incoming email polling", "Gemini-3.5 AI support", "Up to 5 agent accounts", "Standard dashboard metrics"],
              },
              {
                name: "Annual Billing",
                price: "₹1,199",
                period: "/month",
                desc: "Billed annually. Perfect for growing teams.",
                badge: "Save 20%",
                features: ["Unlimited incoming email polling", "Gemini-3.5 AI support", "Up to 25 agent accounts", "Advanced analytics dashboard", "Priority SMTP outbox support"],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className="bg-slate-50/50 p-8 rounded-2xl border border-slate-200/70 flex flex-col justify-between relative group hover:bg-white hover:shadow-md transition-all duration-300"
              >
                {plan.badge && (
                  <span className="absolute top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {plan.badge}
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6">{plan.desc}</p>
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-extrabold text-slate-950 tracking-tight">{plan.price}</span>
                    <span className="text-sm font-semibold text-slate-400 ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600 mb-8 border-t border-slate-200/60 pt-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setDemoDialogOpen(true)}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Book Demo
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ & Contact Section */}
      <section id="contact" className="py-20 md:py-28 bg-slate-50/30 border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* FAQ Block */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
                <HelpCircle className="text-blue-500" size={20} />
                Frequently Asked
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "What AI models are supported?",
                    a: "My HelpDesk utilizes Google's Gemini-3.5-flash LLM model to resolve tickets.",
                  },
                  {
                    q: "How does the IMAP polling work?",
                    a: "The poller periodically signs into your IMAP inbox, filters seen emails, and creates support tickets.",
                  },
                  {
                    q: "Can I manual trigger polling?",
                    a: "Yes! There is a manual 'Poll Inbox Now' tool in the Email Setup settings panel.",
                  },
                ].map((faq, idx) => (
                  <div key={idx} className="bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-sm space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{faq.q}</h4>
                    <p className="text-xs text-slate-500 leading-normal">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact details card */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
                <Phone className="text-blue-500" size={20} />
                Get In Touch
              </h2>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Corporate Office</h3>
                  <p className="text-xs text-slate-500">Founder & CEO: Sahay Yadav</p>
                  <p className="text-xs text-slate-500">CEO & Founder – Bharat Sirvi</p>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📞 Phone:</span>
                    <span className="text-slate-700">+91 9876543210</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📧 Email:</span>
                    <span className="text-slate-700">contact@helpdesk.ai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>🚀</span>
              My HelpDesk
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            © 2024 My HelpDesk. All rights reserved. Registered SaaS CRM provider.
          </p>
        </div>
      </footer>

      {/* Demo Form Dialog */}
      <Dialog
        open={demoDialogOpen}
        onOpenChange={setDemoDialogOpen}
        title="Schedule Live Demo Session"
      >
        <form
          noValidate
          onSubmit={handleSubmit(handleDemoSubmit)}
          className="space-y-4"
        >
          <Input
            label="Name"
            required
            placeholder="Your full name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Contact Phone Number"
            required
            placeholder="+91 98765 43210"
            {...register("contactNumber")}
            error={errors.contactNumber?.message}
          />
          <Input
            label="Work Email Address"
            type="email"
            required
            placeholder="you@company.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Organization"
            required
            placeholder="Your company name"
            {...register("organization")}
            error={errors.organization?.message}
          />
          
          <Select
            label="Interested In"
            options={[
              { value: "FREE_DEMO", label: "Free Trial Demo" },
              { value: "PRODUCT_TOUR", label: "Interactive Product Tour" },
              { value: "CUSTOM_ONBOARDING", label: "Custom Workspace Onboarding" },
            ]}
            value={interestedInValue}
            {...register("interestedIn")}
            error={errors.interestedIn?.message}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDemoDialogOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-750 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              disabled={submitting}
            >
              {submitting ? "Booking..." : "Schedule Session"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default LandingPage;
