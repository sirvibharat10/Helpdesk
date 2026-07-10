import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import Layout from "../components/Layout";

const StatusBadge: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <div className="flex justify-between items-center py-1.5">
    <span className="text-sm text-slate-700">{label}</span>
    <span className={`text-sm font-medium ${ok ? "text-emerald-600" : "text-red-500"}`}>
      {ok ? "✅ Configured" : "❌ Not set"}
    </span>
  </div>
);

const EmailSetupPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [pollMsg, setPollMsg] = useState("");

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

  const handlePollNow = async () => {
    setPolling(true);
    setPollMsg("");
    try {
      const res: any = await api.request("/settings/poll-email", { method: "POST" });
      setPollMsg(res.message || "Inbox polled successfully.");
    } catch (err: any) {
      setPollMsg(`Error: ${err.message}`);
    } finally {
      setPolling(false);
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
        `✅ Ticket created! ID: ${response.id} · Status: ${response.status} · Category: ${response.category}`
      );
      setSimForm({
        fromEmail: "customer@example.com",
        fromName: "Jane Customer",
        subject: "Refund request for order #1092",
        body: "Hi Support team,\n\nI purchased a subscription yesterday but changed my mind. I'd like to request a full refund according to your policy. Thanks!",
      });
    } catch (err: any) {
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

  const smtpOk: boolean = settings?.smtp_configured === true;
  const imapOk: boolean = settings?.imap_configured === true;
  const geminiOk: boolean = settings?.gemini_api_key === "configured";
  const dbOk: boolean = settings?.database_url === "configured";

  return (
    <Layout title="Email Setup">
      <div className="max-w-2xl space-y-6">

        {/* IMAP Status */}
        <div className={`p-6 rounded-xl border ${imapOk ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <h2 className="text-lg font-semibold mb-3" style={{ color: imapOk ? "#065f46" : "#78350f" }}>
            📥 IMAP — Incoming Email Polling
          </h2>
          <div className="text-sm space-y-1 mb-3" style={{ color: imapOk ? "#065f46" : "#78350f" }}>
            <div><strong>Host:</strong> {settings?.imap_host}:{settings?.imap_port} (SSL)</div>
            <div><strong>Account:</strong> {settings?.gmail_user}</div>
            <div><strong>Poll interval:</strong> {Math.round(parseInt(settings?.imap_poll_interval_ms || "60000") / 1000)}s</div>
            <div><strong>Status:</strong> {imapOk ? "🟢 Active — polling inbox automatically" : "🔴 Not configured"}</div>
          </div>
          {imapOk && (
            <div>
              <button
                onClick={handlePollNow}
                disabled={polling}
                className="text-sm px-4 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium disabled:opacity-50"
              >
                {polling ? "Polling..." : "🔄 Poll Inbox Now"}
              </button>
              {pollMsg && (
                <p className="mt-2 text-sm text-emerald-700">{pollMsg}</p>
              )}
            </div>
          )}
          {!imapOk && (
            <div className="text-sm text-amber-800 mt-2">
              <p className="font-medium mb-1">How to enable Gmail IMAP:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <strong>myaccount.google.com</strong> → Security</li>
                <li>Enable <strong>2-Step Verification</strong></li>
                <li>Go to <strong>App Passwords</strong> and generate one for "Mail"</li>
                <li>Set <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code> in backend <code>.env</code></li>
              </ol>
            </div>
          )}
        </div>

        {/* SMTP Status */}
        <div className={`p-6 rounded-xl border ${smtpOk ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <h2 className="text-lg font-semibold mb-3" style={{ color: smtpOk ? "#065f46" : "#78350f" }}>
            📤 SMTP — Outgoing Email (Replies to Customers)
          </h2>
          <div className="text-sm space-y-1" style={{ color: smtpOk ? "#065f46" : "#78350f" }}>
            <div><strong>Host:</strong> {settings?.smtp_host}:{settings?.smtp_port} (STARTTLS)</div>
            <div><strong>Sender:</strong> {settings?.gmail_user}</div>
            <div><strong>Status:</strong> {smtpOk ? "🟢 Active — sending replies via Gmail SMTP" : "🔴 Not configured"}</div>
          </div>
          {!smtpOk && (
            <p className="text-sm text-amber-800 mt-2">
              Set <code>SMTP_USER</code> and <code>SMTP_PASS</code> (or <code>GMAIL_USER</code> + <code>GMAIL_APP_PASSWORD</code>) in <code>.env</code>.
            </p>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Status</h2>
          <div className="divide-y divide-slate-100">
            <StatusBadge ok={imapOk} label="IMAP Email Polling" />
            <StatusBadge ok={smtpOk} label="SMTP Email Sending" />
            <StatusBadge ok={geminiOk} label="Gemini AI" />
            <StatusBadge ok={dbOk} label="Database" />
          </div>
        </div>

        {/* Simulate email */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Simulate Incoming Support Email</h2>
          <p className="text-sm text-slate-500">
            Creates a ticket via the webhook — mimics an email arriving at your support inbox without needing a real email.
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Sender Email</label>
                <input
                  type="email"
                  required
                  value={simForm.fromEmail}
                  onChange={(e) => setSimForm({ ...simForm, fromEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={simForm.fromName}
                  onChange={(e) => setSimForm({ ...simForm, fromName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={simForm.subject}
                onChange={(e) => setSimForm({ ...simForm, subject: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Body</label>
              <textarea
                required
                rows={4}
                value={simForm.body}
                onChange={(e) => setSimForm({ ...simForm, body: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={simulating}
              className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
            >
              {simulating ? "Creating ticket..." : "Send Simulated Email"}
            </button>
          </form>
        </div>

        {/* How it works */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm text-slate-700 space-y-2">
          <h2 className="text-base font-semibold text-slate-900">How Email Integration Works</h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Backend connects to Gmail via <strong>IMAP SSL</strong> (port 993) every {Math.round(parseInt(settings?.imap_poll_interval_ms || "60000") / 1000)}s</li>
            <li>New <strong>unread</strong> emails are parsed and turned into support tickets</li>
            <li>An <strong>acknowledgement email</strong> is sent to the customer immediately via SMTP</li>
            <li>The ticket is <strong>assigned to the AI agent</strong> and queued for classification + auto-resolution</li>
            <li>If AI can resolve it, a reply is saved and also <strong>sent back via Gmail SMTP</strong></li>
            <li>If AI cannot resolve it, ticket status becomes <strong>OPEN</strong> for a human agent</li>
            <li>Processed emails are marked as <strong>Seen</strong> to avoid duplicates</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default EmailSetupPage;
