import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TicketDetailPage from "../TicketDetailPage";
import { api } from "../../lib/api";
import { renderWithQuery } from "./testUtils";

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "ticket-123" }),
    useNavigate: () => vi.fn(),
  };
});

// Mock the API layer
vi.mock("../../lib/api", () => {
  return {
    api: {
      getTicketById: vi.fn(),
      getUsers: vi.fn(),
      updateTicket: vi.fn(),
      addReply: vi.fn(),
    },
  };
});

// Mock the layout component to avoid sidebars/headers rendering overhead
vi.mock("../../components/Layout", () => {
  return {
    default: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    ),
  };
});

const mockTicket = {
  id: "ticket-123",
  subject: "Test Ticket Subject",
  body: "This is a test ticket body",
  status: "NEW",
  category: "TECHNICAL_QUESTION",
  fromEmail: "customer@example.com",
  fromName: "John Customer",
  source: "MANUAL",
  aiClassified: false,
  aiResolved: false,
  assignedToId: null,
  replies: [],
  createdAt: "2026-07-08T12:00:00Z",
};

const mockUsers = [
  { id: "user-1", name: "Agent Alpha", role: "AGENT" },
  { id: "user-2", name: "Agent Beta", role: "AGENT" },
];

describe("TicketDetailPage Assignment & Info Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches ticket details and users, and renders Assigned Agent select correctly", async () => {
    vi.mocked(api.getTicketById).mockResolvedValue(mockTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    expect(api.getTicketById).toHaveBeenCalledWith("ticket-123");
    expect(api.getUsers).toHaveBeenCalled();

    // Select elements in sidebar are status, category, and assignedToId
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBe(3); // Status, Category, and Assigned Agent
    
    // Assigned Agent is the third dropdown
    const select = selects[2];
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("");

    expect(screen.getByText("Agent Alpha (AGENT)")).toBeInTheDocument();
    expect(screen.getByText("Agent Beta (AGENT)")).toBeInTheDocument();
  });

  it("triggers api.updateTicket when a new assignee is selected", async () => {
    vi.mocked(api.getTicketById).mockResolvedValue(mockTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);
    vi.mocked(api.updateTicket).mockResolvedValue({
      ...mockTicket,
      assignedToId: "user-1",
    });

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const select = selects[2];
    fireEvent.change(select, { target: { value: "user-1" } });

    await waitFor(() => {
      expect(api.updateTicket).toHaveBeenCalledWith("ticket-123", {
        assignedToId: "user-1",
      });
    });
  });

  it("triggers api.updateTicket with null when Unassigned is selected", async () => {
    const assignedTicket = { ...mockTicket, assignedToId: "user-1" };
    vi.mocked(api.getTicketById).mockResolvedValue(assignedTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);
    vi.mocked(api.updateTicket).mockResolvedValue({
      ...mockTicket,
      assignedToId: null,
    });

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const select = selects[2];
    expect(select).toHaveValue("user-1");

    fireEvent.change(select, { target: { value: "" } });

    await waitFor(() => {
      expect(api.updateTicket).toHaveBeenCalledWith("ticket-123", {
        assignedToId: null,
      });
    });
  });

  it("triggers api.updateTicket when status is changed", async () => {
    vi.mocked(api.getTicketById).mockResolvedValue(mockTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);
    vi.mocked(api.updateTicket).mockResolvedValue({
      ...mockTicket,
      status: "OPEN",
    });

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const statusSelect = selects[0]; // Status is the first dropdown
    expect(statusSelect).toHaveValue("NEW");

    fireEvent.change(statusSelect, { target: { value: "OPEN" } });

    await waitFor(() => {
      expect(api.updateTicket).toHaveBeenCalledWith("ticket-123", {
        status: "OPEN",
      });
    });
  });

  it("triggers api.updateTicket when category is changed", async () => {
    vi.mocked(api.getTicketById).mockResolvedValue(mockTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);
    vi.mocked(api.updateTicket).mockResolvedValue({
      ...mockTicket,
      category: "REFUND_REQUEST",
    });

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const categorySelect = selects[1]; // Category is the second dropdown
    expect(categorySelect).toHaveValue("TECHNICAL_QUESTION");

    fireEvent.change(categorySelect, { target: { value: "REFUND_REQUEST" } });

    await waitFor(() => {
      expect(api.updateTicket).toHaveBeenCalledWith("ticket-123", {
        category: "REFUND_REQUEST",
      });
    });
  });
});
