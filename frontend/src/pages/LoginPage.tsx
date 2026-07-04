import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import Button from "../components/Button";
import Input from "../components/Input";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result: any = await api.login(email, password);
      setAuth(result.token, result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: "ADMIN" | "AGENT") => {
    if (role === "ADMIN") {
      setEmail("admin@sahayak.ai");
      setPassword("admin123");
    } else {
      setEmail("agent@sahayak.ai");
      setPassword("agent123");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-800 text-white flex-col justify-between p-12">
        <div>
          <h1 className="text-4xl font-bold mb-8">🚀 SahaYak AI</h1>
          <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>
          <ul className="space-y-4 text-lg">
            <li>✓ AI-Powered Ticket Management</li>
            <li>✓ Intelligent Routing & Classification</li>
            <li>✓ Real-time Collaboration</li>
            <li>✓ Advanced Analytics</li>
          </ul>
        </div>
        <div className="flex gap-8 justify-center">
          <div className="w-12 h-12 bg-blue-700 rounded-full"></div>
          <div className="w-12 h-12 bg-blue-600 rounded-full"></div>
          <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-600">Access your SahaYak AI dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">Demo Credentials</p>
            <div className="space-y-3">
              <div
                onClick={() => fillCredentials("ADMIN")}
                className="p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <p className="font-semibold text-slate-900">Admin</p>
                <p className="text-sm text-slate-600">admin@sahayak.ai</p>
                <p className="text-sm text-slate-600">Pass: admin123</p>
              </div>
              <div
                onClick={() => fillCredentials("AGENT")}
                className="p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <p className="font-semibold text-slate-900">Agent</p>
                <p className="text-sm text-slate-600">agent@sahayak.ai</p>
                <p className="text-sm text-slate-600">Pass: agent123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
