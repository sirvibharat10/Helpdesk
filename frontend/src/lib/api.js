export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem("auth_token");
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
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
            return {};
        }
        return response.json();
    },
    // Auth
    login(email, password) {
        return this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    },
    getCurrentUser() {
        return this.request("/auth/me");
    },
    // Tickets
    getTickets(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.keys(filters).forEach((key) => {
                if (filters[key])
                    params.append(key, filters[key]);
            });
        }
        return this.request(`/tickets?${params.toString()}`);
    },
    getTicketById(id) {
        return this.request(`/tickets/${id}`);
    },
    createTicket(data) {
        return this.request("/tickets", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateTicket(id, data) {
        return this.request(`/tickets/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
    deleteTicket(id) {
        return this.request(`/tickets/${id}`, { method: "DELETE" });
    },
    addReply(ticketId, body, sentViaEmail = false) {
        return this.request(`/tickets/${ticketId}/replies`, {
            method: "POST",
            body: JSON.stringify({ body, sentViaEmail }),
        });
    },
    classifyTicket(id) {
        return this.request(`/tickets/${id}/classify`, { method: "POST" });
    },
    summarizeTicket(id) {
        return this.request(`/tickets/${id}/summarize`, { method: "POST" });
    },
    suggestReply(id) {
        return this.request(`/tickets/${id}/suggest-reply`, { method: "POST" });
    },
    // Users
    getUsers() {
        return this.request("/users");
    },
    createUser(data) {
        return this.request("/users", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateUser(id, data) {
        return this.request(`/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
    deleteUser(id) {
        return this.request(`/users/${id}`, { method: "DELETE" });
    },
    // Settings
    getSettings() {
        return this.request("/settings");
    },
    sendDemoInquiry(data) {
        return this.request("/settings/demo-inquiry", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};
