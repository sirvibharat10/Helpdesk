import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import Layout from "../components/Layout";

const EmailSetupPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simForm, setSimForm] = useState({
    fromEmail: "customer@example.com",
    fromName: "Jane Customer",
    subject: "Refund request for order #1092",
    body: "Hi Support team,\n\nI purchased a subscription yesterday but changed my mind. I'd like to request a full refund according to your policy. Thanks!",
  });
  const [simulating, setSimulating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleSimulateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const response: any = await api.simulateIncomingEmail(simForm);
      setSuccessMsg(
        `Success! Simulated email processed. Created Ticket #${response.id} with status "${response.status}" and auto-classified category "${response.category}" (AI classified: ${response.aiClassified ? "Yes" : "No"}).`
      );
      setSimForm({
        fromEmail: "customer@example.com",
        fromName: "Jane Customer",
        subject: "Refund request for order #1092",
        body: "Hi Support team,\n\nI purchased a subscription yesterday but changed my mind. I'd like to request a full refund according to your policy. Thanks!",
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to simulate email ingestion");
    } finally {
      setSimulating(false);
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

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Simulate Support Email Ingestion
          </h2>
          <p className="text-sm text-slate-500">
            Test the email-to-ticket conversion webhook flow. This simulates an incoming email sent to the organization's support desk address.
          </p>

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg border border-emerald-200 text-sm">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSimulateEmail} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sender Email
                </label>
                <input
                  type="email"
                  required
                  value={simForm.fromEmail}
                  onChange={(e) => setSimForm({ ...simForm, fromEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors bg-white text-sm"
                  placeholder="sender@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={simForm.fromName}
                  onChange={(e) => setSimForm({ ...simForm, fromName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors bg-white text-sm"
                  placeholder="Jane Customer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={simForm.subject}
                onChange={(e) => setSimForm({ ...simForm, subject: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors bg-white text-sm"
                placeholder="Refund request for order #1092"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Body
              </label>
              <textarea
                required
                rows={4}
                value={simForm.body}
                onChange={(e) => setSimForm({ ...simForm, body: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors bg-white text-sm resize-none"
                placeholder="Explain the support issue..."
              />
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="w-full bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-200 text-sm disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {simulating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Simulating Email Ingestion...
                </>
              ) : (
                "Send Simulated Support Email"
              )}
            </button>
          </form>
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
