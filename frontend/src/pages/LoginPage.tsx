import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import Input from "../components/Input";
import { Sparkles, ArrowLeft } from "lucide-react";

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
          <div className="mb-6 text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 tracking-wider uppercase">
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
            className="space-y-6"
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
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
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

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
