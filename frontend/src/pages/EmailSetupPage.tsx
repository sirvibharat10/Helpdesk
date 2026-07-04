import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import Layout from "../components/Layout";

const EmailSetupPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data: any = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Email Setup">
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Email Setup">
      <div className="max-w-2xl space-y-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Gmail IMAP Setup
          </h2>
          <div className="space-y-4 text-sm text-blue-900">
            <p>To enable automatic email polling, you need to:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your Google Account settings</li>
              <li>Enable 2-Step Verification</li>
              <li>Generate an App Password for your email client</li>
              <li>
                Use the App Password in the GMAIL_APP_PASSWORD environment
                variable
              </li>
            </ol>
            <p className="mt-4">
              <strong>Current Configuration:</strong>
            </p>
            <div className="bg-white p-3 rounded mt-2 space-y-2">
              <div>
                <span className="font-medium">Gmail User:</span>
                <span className="ml-2 text-slate-600">
                  {settings?.gmail_user}
                </span>
              </div>
              <div>
                <span className="font-medium">Support Email:</span>
                <span className="ml-2 text-slate-600">
                  {settings?.support_email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h2 className="text-lg font-semibold text-green-900 mb-4">
            API Keys Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Gemini API Key:</span>
              <span
                className={
                  settings?.gemini_api_key === "Not set"
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {settings?.gemini_api_key === "Not set"
                  ? "❌ Not configured"
                  : "✅ Configured"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Resend API Key:</span>
              <span
                className={
                  settings?.resend_api_key === "Not set"
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {settings?.resend_api_key === "Not set"
                  ? "❌ Not configured"
                  : "✅ Configured"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span
                className={
                  settings?.database_url === "Not set"
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {settings?.database_url === "Not set"
                  ? "❌ Not configured"
                  : "✅ Configured"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-900 mb-4">
            Email Polling
          </h2>
          <p className="text-sm text-yellow-900 mb-3">
            The system polls your Gmail inbox every 30 seconds to check for new
            emails and automatically create support tickets.
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
            <li>Only processes emails received after server start</li>
            <li>Auto-classifies emails using AI</li>
            <li>Marks processed emails as read</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default EmailSetupPage;
