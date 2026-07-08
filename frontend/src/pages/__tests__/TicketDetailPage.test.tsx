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

  it("renders the reply thread successfully when replies exist", async () => {
    const ticketWithReplies = {
      ...mockTicket,
      replies: [
        {
          id: "reply-1",
          body: "This is a reply body from agent",
          isAI: false,
          sentViaEmail: false,
          senderType: "AGENT",
          createdAt: "2026-07-08T12:05:00Z",
          author: { name: "Agent Alpha" },
        },
        {
          id: "reply-2",
          body: "This is an AI generated response",
          isAI: true,
          sentViaEmail: true,
          senderType: "AI",
          createdAt: "2026-07-08T12:06:00Z",
          author: null,
        },
      ],
    };

    vi.mocked(api.getTicketById).mockResolvedValue(ticketWithReplies);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Replies (2)")).toBeInTheDocument();
    });

    // Verify reply details
    expect(screen.getByText("Agent Alpha")).toBeInTheDocument();
    expect(screen.getByText("This is a reply body from agent")).toBeInTheDocument();

    expect(screen.getByText("Bot")).toBeInTheDocument();
    expect(screen.getByText("This is an AI generated response")).toBeInTheDocument();
  });

  it("submits a reply via email successfully", async () => {
    vi.mocked(api.getTicketById).mockResolvedValue(mockTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);
    vi.mocked(api.addReply).mockResolvedValue({
      id: "new-reply-id",
      body: "Sent via email test content",
      isAI: false,
      sentViaEmail: true,
      createdAt: new Date().toISOString(),
    });

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("Type your reply...");
    fireEvent.change(textarea, { target: { value: "Sent via email test content" } });

    const sendButton = screen.getByText("Send via Email");
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(api.addReply).toHaveBeenCalledWith("ticket-123", "Sent via email test content", true);
    });
  });

  it("saves a reply as a note successfully", async () => {
    vi.mocked(api.getTicketById).mockResolvedValue(mockTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);
    vi.mocked(api.addReply).mockResolvedValue({
      id: "new-reply-id",
      body: "Save as note test content",
      isAI: false,
      sentViaEmail: false,
      createdAt: new Date().toISOString(),
    });

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("Type your reply...");
    fireEvent.change(textarea, { target: { value: "Save as note test content" } });

    const saveButton = screen.getByText("Save as Note");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.addReply).toHaveBeenCalledWith("ticket-123", "Save as note test content", false);
    });
  });

  it("does not call api.addReply when body is empty or whitespace", async () => {
    vi.mocked(api.getTicketById).mockResolvedValue(mockTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    const sendButton = screen.getByText("Send via Email");
    fireEvent.click(sendButton);

    expect(api.addReply).not.toHaveBeenCalled();
  });

  it("triggers alert and preserves textarea content when api.addReply fails", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.mocked(api.getTicketById).mockResolvedValue(mockTicket);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);
    vi.mocked(api.addReply).mockRejectedValue(new Error("Network Error"));

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Ticket Subject")).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("Type your reply...");
    fireEvent.change(textarea, { target: { value: "Failed submission content" } });

    const saveButton = screen.getByText("Save as Note");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.addReply).toHaveBeenCalled();
    });

    expect(alertMock).toHaveBeenCalledWith("Failed to add reply");
    expect(textarea).toHaveValue("Failed submission content");

    alertMock.mockRestore();
  });

  it("copies suggested reply content to composer textarea when Use This Reply is clicked", async () => {
    const ticketWithSuggestedReply = {
      ...mockTicket,
      suggestedReply: "This is a lovely suggested reply.",
    };

    vi.mocked(api.getTicketById).mockResolvedValue(ticketWithSuggestedReply);
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);

    renderWithQuery(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Suggested Reply:")).toBeInTheDocument();
    });

    const useButton = screen.getByText("Use This Reply");
    fireEvent.click(useButton);

    const textarea = screen.getByPlaceholderText("Type your reply...");
    expect(textarea).toHaveValue("This is a lovely suggested reply.");
  });
});
