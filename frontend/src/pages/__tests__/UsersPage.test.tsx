import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UsersPage from "../UsersPage";
import { api } from "../../lib/api";
import { renderWithQuery } from "./testUtils";

// Mock the API layer
vi.mock("../../lib/api", () => {
  return {
    api: {
      getUsers: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
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

const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@sahayak.ai",
    role: "ADMIN",
    createdAt: "2026-07-07T12:00:00Z",
  },
  {
    id: "2",
    name: "Agent User",
    email: "agent@sahayak.ai",
    role: "AGENT",
    createdAt: "2026-07-07T12:00:00Z",
  },
];

describe("UsersPage Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loader table skeleton when loading", async () => {
    // Return a promise that doesn't resolve immediately to keep it in loading state
    vi.mocked(api.getUsers).mockReturnValue(new Promise(() => {}));

    renderWithQuery(<UsersPage />);

    // Verify skeleton header rows are visible
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();

    // Verify skeleton animation classes are rendered
    const loaderRows = document.querySelectorAll(".animate-pulse");
    expect(loaderRows.length).toBeGreaterThan(0);
  });

  it("renders list of users successfully", async () => {
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers);

    renderWithQuery(<UsersPage />);

    // Wait for the mock users to appear
    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
      expect(screen.getByText("Agent User")).toBeInTheDocument();
    });

    expect(screen.getByText("admin@sahayak.ai")).toBeInTheDocument();
    expect(screen.getByText("agent@sahayak.ai")).toBeInTheDocument();

    // Admin should show ADMIN role badge and Shield icon text
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    // Agent should show AGENT role badge
    expect(screen.getByText("AGENT")).toBeInTheDocument();
  });

  it("renders error state when fetching users fails", async () => {
    vi.mocked(api.getUsers).mockRejectedValue(new Error("Database connection failed"));

    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Database connection failed")).toBeInTheDocument();
    });
  });

  it("opens create user modal, triggers validation errors, and creates a user successfully", async () => {
    vi.mocked(api.getUsers).mockResolvedValue([]);
    vi.mocked(api.createUser).mockResolvedValue({
      id: "3",
      name: "New User",
      email: "new@example.com",
      role: "AGENT",
      createdAt: "2026-07-07T12:00:00Z",
    });

    const { container } = renderWithQuery(<UsersPage />);

    // Click on Add User button
    const addButton = screen.getByText("Add User");
    fireEvent.click(addButton);

    // Dialog should open
    expect(screen.getByText("Add New User")).toBeInTheDocument();

    // Try submitting empty form to trigger validation errors
    const createButton = screen.getByText("Create User");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Name must be at least 3 characters")).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
    });

    // Fill form and submit using input name attributes
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "New User" } });
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(createButton);

    await waitFor(() => {
      expect(api.createUser).toHaveBeenCalledWith({
        name: "New User",
        email: "new@example.com",
        password: "password123",
        role: "AGENT",
      });
      // Dialog should close
      expect(screen.queryByText("Add New User")).not.toBeInTheDocument();
    });
  });

  it("opens edit user modal, loads current profile details, and updates user successfully", async () => {
    vi.mocked(api.getUsers).mockResolvedValue([mockUsers[1]]); // Agent User
    vi.mocked(api.updateUser).mockResolvedValue({
      ...mockUsers[1],
      name: "Updated Agent",
      role: "ADMIN",
    });

    const { container } = renderWithQuery(<UsersPage />);

    // Wait for the user row to load
    await waitFor(() => {
      expect(screen.getByText("Agent User")).toBeInTheDocument();
    });

    // Query edit button via aria-label
    const editBtn = screen.getByRole("button", { name: "Edit Agent User" });
    fireEvent.click(editBtn);

    // Edit dialog should show details
    expect(screen.getByText("Edit User Profile")).toBeInTheDocument();
    
    // Query inputs in container
    const nameInput = container.querySelector('form input[name="name"]') as HTMLInputElement;
    const emailInput = container.querySelector('form input[name="email"]') as HTMLInputElement;
    const roleSelect = container.querySelector('form select[name="role"]') as HTMLSelectElement;

    // Ensure inputs are pre-populated
    expect(nameInput.value).toBe("Agent User");
    expect(emailInput.value).toBe("agent@sahayak.ai");

    // Modify fields
    fireEvent.change(nameInput, { target: { value: "Updated Agent" } });
    fireEvent.change(roleSelect, { target: { value: "ADMIN" } });

    // Submit changes
    const saveButton = screen.getByText("Save Changes");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.updateUser).toHaveBeenCalledWith("2", {
        name: "Updated Agent",
        email: "agent@sahayak.ai",
        role: "ADMIN",
      });
      expect(screen.queryByText("Edit User Profile")).not.toBeInTheDocument();
    });
  });

  it("opens delete confirmation modal and deletes user successfully", async () => {
    vi.mocked(api.getUsers).mockResolvedValue([mockUsers[1]]); // Agent User
    vi.mocked(api.deleteUser).mockResolvedValue({});

    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Agent User")).toBeInTheDocument();
    });

    // Query delete button via aria-label
    const deleteBtn = screen.getByRole("button", { name: "Delete Agent User" });
    fireEvent.click(deleteBtn);

    // Dialog should open
    expect(screen.getByText("Confirm User Deletion")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete user/)).toBeInTheDocument();

    // Confirm deletion
    const confirmBtn = screen.getByText("Delete User");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteUser).toHaveBeenCalledWith("2");
      expect(screen.queryByText("Confirm User Deletion")).not.toBeInTheDocument();
    });
  });
});
