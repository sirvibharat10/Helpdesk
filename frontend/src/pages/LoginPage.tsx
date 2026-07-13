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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/50 flex flex-col justify-between items-center p-6 md:p-12 relative overflow-hidden font-sans select-none">
      {/* Extremely subtle background glows for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-slate-100/40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-slate-200/30 blur-3xl pointer-events-none"></div>

      {/* Header Area: Back Button */}
      <div className="w-full max-w-[480px] flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to overview
        </Link>
      </div>

      {/* Centered Login Card Area */}
      <div className="w-full max-w-[480px] my-auto py-10">
        <div className="bg-white rounded-[28px] shadow-2xl shadow-slate-200/50 border border-slate-200/50 p-12 md:p-14 space-y-10 hover:shadow-3xl transition-all duration-300">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full">
              <Sparkles size={11} className="animate-pulse text-blue-600" />
              AI Agent Desk
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none pt-1">Welcome Back 👋</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Sign in to continue managing your AI Help Desk.</p>
            </div>
          </div>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit(handleLogin)} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold border border-red-100/60 leading-normal animate-shake">
                ⚠️ {error}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="you@company.com"
                  {...register("email")}
                  className={`w-full pl-11 pr-4 py-4 bg-slate-50/50 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm font-medium ${
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-slate-200/80 focus:border-blue-500 focus:ring-blue-100/80"
                  }`}
                />
              </div>
              {errors.email?.message && (
                <p className="text-red-600 text-xs font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Account Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-11 pr-4 py-4 bg-slate-50/50 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm font-medium ${
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-slate-200/80 focus:border-blue-500 focus:ring-blue-100/80"
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
              className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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

      {/* Footer Branding Area */}
      <div className="w-full max-w-[480px] text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          My HelpDesk © 2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
