export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = {
  async request<T>(
    endpoint: string,
    options: RequestInit & { method?: string } = {},
  ): Promise<T> {
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },

  // Auth
  login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser() {
    return this.request("/auth/me");
  },

  // Tickets
  getTickets(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });
    }
    return this.request(`/tickets?${params.toString()}`);
  },

  getStats() {
    return this.request("/tickets/stats");
  },

  getDailyStats() {
    return this.request("/tickets/daily-stats");
  },

  getTicketById(id: string) {
    return this.request(`/tickets/${id}`);
  },

  createTicket(data: any) {
    return this.request("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTicket(id: string, data: any) {
    return this.request(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteTicket(id: string) {
    return this.request(`/tickets/${id}`, { method: "DELETE" });
  },

  addReply(ticketId: string, body: string, sentViaEmail: boolean = false, bodyHtml?: string) {
    return this.request(`/tickets/${ticketId}/replies`, {
      method: "POST",
      body: JSON.stringify({ body, bodyHtml, sentViaEmail }),
    });
  },

  classifyTicket(id: string) {
    return this.request(`/tickets/${id}/classify`, { method: "POST" });
  },

  summarizeTicket(id: string) {
    return this.request(`/tickets/${id}/summarize`, { method: "POST" });
  },

  suggestReply(id: string) {
    return this.request(`/tickets/${id}/suggest-reply`, { method: "POST" });
  },

  polishReply(id: string, replyBody: string) {
    return this.request(`/tickets/${id}/polish-reply`, {
      method: "POST",
      body: JSON.stringify({ replyBody }),
    });
  },

  // Users
  getUsers() {
    return this.request("/users");
  },

  createUser(data: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: "DELETE" });
  },

  // Settings
  getSettings() {
    return this.request("/settings");
  },

  sendDemoInquiry(data: any) {
    return this.request("/settings/demo-inquiry", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  simulateIncomingEmail(data: any) {
    return this.request("/tickets/incoming-email", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
