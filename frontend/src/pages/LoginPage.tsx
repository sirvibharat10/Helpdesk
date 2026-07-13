import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { ArrowLeft, Mail, Lock, Bot, Zap } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");

    try {
      const result: any = await api.login(data.email, data.password);
      setAuth(result.token, result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between overflow-hidden font-sans select-none"
      style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 40%, #ffffff 70%, #eff6ff 100%)" }}
    >
      {/* Premium background layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large sky-blue orb top-left */}
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, #7dd3fc 0%, #bae6fd 50%, transparent 75%)", filter: "blur(60px)" }} />
        {/* Indigo orb bottom-right */}
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #a5b4fc 0%, #c7d2fe 50%, transparent 75%)", filter: "blur(60px)" }} />
        {/* Subtle center bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)", filter: "blur(40px)" }} />
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      {/* Back button area */}
      <div className="w-full max-w-[520px] px-6 pt-8 flex justify-start relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700/80 hover:text-sky-900 transition-colors duration-200 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to overview
        </Link>
      </div>

      {/* Main login card */}
      <div className="w-full max-w-[520px] px-6 py-8 flex-1 flex items-center relative z-10">
        <div className="w-full"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "28px",
            border: "1px solid rgba(186, 230, 253, 0.6)",
            boxShadow: "0 8px 32px rgba(14, 165, 233, 0.08), 0 32px 64px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255,255,255,0.9) inset",
            padding: "52px 48px",
          }}
        >
          {/* Branding / Logo section */}
          <div className="text-center mb-10">
            {/* Logo icon */}
            <div className="inline-flex items-center justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl blur-md opacity-40"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }} />
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)", boxShadow: "0 4px 16px rgba(14, 165, 233, 0.3)" }}
                >
                  <Bot size={26} className="text-white" />
                </div>
              </div>
            </div>

            {/* Brand name */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xl font-black tracking-tight"
                style={{ background: "linear-gradient(135deg, #0284c7, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                My HelpDesk
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                <Zap size={9} className="text-sky-500" />
                AI
              </span>
            </div>

            {/* Heading & subtitle */}
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              Sign in to continue managing your AI-powered support desk.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-semibold leading-normal">
              <span className="text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login form */}
          <form noValidate onSubmit={handleSubmit(handleLogin)}>

            {/* Email field */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2.5">
                Work Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors duration-200 z-10">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="you@company.com"
                  {...register("email")}
                  className="w-full"
                  style={{
                    paddingLeft: "44px",
                    paddingRight: "16px",
                    paddingTop: "16px",
                    paddingBottom: "16px",
                    background: errors.email ? "rgba(254, 242, 242, 0.8)" : "rgba(241, 245, 249, 0.5)",
                    border: errors.email ? "1.5px solid #fca5a5" : "1.5px solid rgba(186, 230, 253, 0.6)",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#1e293b",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = errors.email ? "1.5px solid #f87171" : "1.5px solid #38bdf8";
                    e.target.style.boxShadow = errors.email ? "0 0 0 3px rgba(248, 113, 113, 0.15)" : "0 0 0 3px rgba(56, 189, 248, 0.15)";
                    e.target.style.background = "rgba(255, 255, 255, 0.9)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = errors.email ? "1.5px solid #fca5a5" : "1.5px solid rgba(186, 230, 253, 0.6)";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = errors.email ? "rgba(254, 242, 242, 0.8)" : "rgba(241, 245, 249, 0.5)";
                  }}
                />
              </div>
              {errors.email?.message && (
                <p className="mt-2 text-red-500 text-xs font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2.5">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors duration-200 z-10">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••"
                  {...register("password")}
                  className="w-full"
                  style={{
                    paddingLeft: "44px",
                    paddingRight: "16px",
                    paddingTop: "16px",
                    paddingBottom: "16px",
                    background: errors.password ? "rgba(254, 242, 242, 0.8)" : "rgba(241, 245, 249, 0.5)",
                    border: errors.password ? "1.5px solid #fca5a5" : "1.5px solid rgba(186, 230, 253, 0.6)",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#1e293b",
                    outline: "none",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.15em",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = errors.password ? "1.5px solid #f87171" : "1.5px solid #38bdf8";
                    e.target.style.boxShadow = errors.password ? "0 0 0 3px rgba(248, 113, 113, 0.15)" : "0 0 0 3px rgba(56, 189, 248, 0.15)";
                    e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    e.target.style.letterSpacing = "0.15em";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = errors.password ? "1.5px solid #fca5a5" : "1.5px solid rgba(186, 230, 253, 0.6)";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = errors.password ? "rgba(254, 242, 242, 0.8)" : "rgba(241, 245, 249, 0.5)";
                  }}
                />
              </div>
              {errors.password?.message && (
                <p className="mt-2 text-red-500 text-xs font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me & Forgot password row */}
            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  style={{ accentColor: "#0ea5e9", borderRadius: "6px" }}
                />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => alert("Credentials reset is managed by your administrator.")}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors duration-200 hover:underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden font-bold text-white text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform duration-100"
              style={{
                padding: "17px 24px",
                borderRadius: "16px",
                background: loading
                  ? "linear-gradient(135deg, #60a5fa, #818cf8)"
                  : "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)",
                boxShadow: "0 4px 20px rgba(14, 165, 233, 0.35), 0 1px 4px rgba(0,0,0,0.1)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(14, 165, 233, 0.45), 0 2px 8px rgba(0,0,0,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(14, 165, 233, 0.35), 0 1px 4px rgba(0,0,0,0.1)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {/* Shine effect overlay */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)" }} />
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign in to Workspace"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[520px] px-6 pb-8 text-center relative z-10">
        <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
          My HelpDesk &copy; 2026 · Powered by Gemini AI
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
