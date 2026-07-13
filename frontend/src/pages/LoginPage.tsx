import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Sparkles, ArrowLeft, Mail, Lock } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50 flex items-stretch overflow-hidden font-sans select-none relative">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[40%] w-[500px] h-[500px] rounded-full bg-sky-100/50 blur-3xl pointer-events-none"></div>

      {/* Main split-screen container */}
      <div className="w-full flex">
        {/* Left Side: Login Form Column */}
        <div className="flex-1 flex flex-col justify-between p-8 md:p-12 relative z-10">
          {/* Header Back Button */}
          <div className="w-full max-w-[460px] mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to overview
            </Link>
          </div>

          {/* Form Card wrapper */}
          <div className="w-full max-w-[460px] mx-auto my-auto py-12">
            <div className="bg-white rounded-[24px] shadow-xl shadow-slate-100 border border-slate-200/50 p-10 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                  <Sparkles size={11} className="animate-pulse text-blue-600" />
                  AI Agent Desk
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none pt-1">Welcome Back 👋</h2>
                <p className="text-sm text-slate-500 font-medium">Sign in to continue managing your AI Help Desk.</p>
              </div>

              {/* Form */}
              <form noValidate onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                {error && (
                  <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold border border-red-100/60 leading-normal animate-shake">
                    ⚠️ {error}
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Work Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      {...register("email")}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm font-medium ${
                        errors.email
                          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                          : "border-slate-200/80 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                  </div>
                  {errors.email?.message && (
                    <p className="text-red-600 text-xs font-semibold">{errors.email.message}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Account Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm font-medium ${
                        errors.password
                          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                          : "border-slate-200/80 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                  </div>
                  {errors.password?.message && (
                    <p className="text-red-600 text-xs font-semibold">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                    />
                    <span>Remember Me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Credentials reset is managed by your administrator.")}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Authenticating...
                    </>
                  ) : (
                    "Sign In to Workspace"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Footer branding */}
          <div className="w-full max-w-[460px] mx-auto text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              My HelpDesk © 2026
            </p>
          </div>
        </div>

        {/* Right Side: Premium Illustration Panel */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden items-center justify-center p-12">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="max-w-lg w-full space-y-8 text-center text-white relative z-10 flex flex-col items-center">
            {/* Premium graphics */}
            <div className="relative w-72 h-48 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col justify-between animate-fade-in">
              {/* Chat bubbles */}
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">U</div>
                  <div className="bg-white/10 border border-white/5 rounded-2xl px-3 py-1.5 text-left text-[11px] max-w-[200px] leading-snug">
                    How do I refund a charged invoice?
                  </div>
                </div>
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="bg-blue-600 rounded-2xl px-3 py-1.5 text-left text-[11px] max-w-[200px] leading-snug animate-pulse">
                    Generating AI reply from KB...
                  </div>
                  <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold">🤖</div>
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between text-[10px] border-t border-white/10 pt-3 text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  AI Agent Online
                </span>
                <span>Ticket #4028 Resolved</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-black tracking-tight">AI-Powered Support Desk</h3>
              <p className="text-sm text-blue-100 font-medium leading-relaxed max-w-sm mx-auto">
                Streamline workflows with auto-classification, instant summaries, and smart knowledge-base suggestions.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 w-24">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                "Smarter support. Faster resolutions. Powered by AI."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
