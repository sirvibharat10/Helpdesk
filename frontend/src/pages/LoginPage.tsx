import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import Input from "../components/Input";
import { Sparkles, ArrowLeft, Shield, User } from "lucide-react";

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
    reset,
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

  const fillCredentials = (role: "ADMIN" | "AGENT") => {
    if (role === "ADMIN") {
      reset({ email: "admin@helpdesk.ai", password: "admin123" });
    } else {
      reset({ email: "agent@helpdesk.ai", password: "agent123" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      {/* Dynamic Floating Glow Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-indigo-400/20 blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to overview
        </Link>

        {/* Elevated Premium Auth Card */}
        <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-white/70 shadow-2xl p-8 relative overflow-hidden group">
          
          {/* Card header */}
          <div className="mb-8 text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 tracking-wider uppercase mb-1">
              <Sparkles size={12} className="animate-pulse" />
              Secure Authentication Gate
            </span>
            <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400">Enter your credentials to manage your support desk</p>
          </div>

          {/* Form */}
          <form
            noValidate
            onSubmit={handleSubmit(handleLogin)}
            className="space-y-5"
          >
            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-100/60 leading-normal animate-shake">
                ⚠️ {error}
              </div>
            )}

            <Input
              label="Work Email Address"
              type="email"
              placeholder="you@company.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Account Password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />

            {/* Extra Row: Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                Remember Me
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo credentials picker block */}
          <div className="mt-8 pt-6 border-t border-slate-200/50 space-y-4">
            <span className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Fill Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillCredentials("ADMIN")}
                className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/60 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-left rounded-xl transition-all cursor-pointer group/btn"
              >
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 group-hover/btn:bg-blue-100 group-hover/btn:text-blue-600 shrink-0">
                  <Shield size={14} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 group-hover/btn:text-blue-800">Admin</span>
                  <span className="block text-[9px] text-slate-400">admin@helpdesk.ai</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => fillCredentials("AGENT")}
                className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/60 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-left rounded-xl transition-all cursor-pointer group/btn"
              >
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 group-hover/btn:bg-blue-100 group-hover/btn:text-blue-600 shrink-0">
                  <User size={14} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 group-hover/btn:text-blue-800">Agent</span>
                  <span className="block text-[9px] text-slate-400">agent@helpdesk.ai</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
