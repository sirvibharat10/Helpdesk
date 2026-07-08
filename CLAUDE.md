# SahaYak HelpDesk - AI Assistant Guidelines (CLAUDE.md)

This file contains instructions for building, running, testing, and writing component tests for this workspace.

## Command Reference

### Development
- Start both backend and frontend: `npm run dev`
- Start backend only: `npm run dev:backend`
- Start frontend only: `npm run dev:frontend`

### Building
- Build entire project: `npm run build`
- Build backend only: `npm run build:backend`
- Build frontend only: `npm run build:frontend`

### Testing
- Run frontend component tests: `npm run test:frontend`
- Run watch mode for frontend component tests (inside `frontend/` directory): `npm run test:watch`

---

## Component Testing Guidelines

We use **Vitest** + **jsdom** + **React Testing Library (RTL)** for frontend component testing.

### Test Locations and Naming
- Place tests in a `__tests__` subdirectory adjacent to the component under test.
- Test files must be named `[ComponentName].test.tsx`.

### Core Setup & Helpers
- **Global setup**: Standard DOM matchers are imported via `frontend/src/setupTests.ts`.
- **Query & Router Context Wrapper**: Always use the custom `renderWithQuery` helper rather than the standard RTL `render` to mount components. This avoids context crash issues.
  ```typescript
  import { renderWithQuery } from "./testUtils";
  
  // Usage
  const { container } = renderWithQuery(<UsersPage />);
  ```
  This helper is located in [testUtils.tsx](file:///c:/Users/Bhara/Desktop/HELPDESK/frontend/src/pages/__tests__/testUtils.tsx).

### Mocking API Calls
- Mock all calls to the backend API layer in `frontend/src/lib/api.ts` by adding a mock at the top of your test file:
  ```typescript
  import { api } from "../../lib/api";
  
  vi.mock("../../lib/api", () => ({
    api: {
      getUsers: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
    }
  }));
  ```

### Element Querying Conventions
- **Accessibility & Buttons**: Icon buttons and action items should have descriptive `aria-label` attributes (e.g. `aria-label="Edit John Doe"`). Test queries should find them using accessible names:
  ```typescript
  const editBtn = screen.getByRole("button", { name: "Edit John Doe" });
  ```
- **Inputs & Labels**: Since input elements inside components might not be linked directly to their labels via `htmlFor`, query form inputs using their `name` attributes or placeholder values:
  ```typescript
  const nameInput = container.querySelector('input[name="name"]');
  const emailInput = container.querySelector('input[name="email"]');
  ```

---

## Code Conventions

### Data Validation
- Always use **React Hook Form** + **Zod** for frontend form handling and input validation (e.g., when adding a new user, updating profiles).
- Backend validator schemas are centralized in [validators.ts](file:///c:/Users/Bhara/Desktop/HELPDESK/backend/src/validators.ts).
- Frontend forms should pair `useForm` with `zodResolver` from `@hookform/resolvers/zod` to validate user inputs against a defined Zod schema before triggering submit callbacks.

### Enums & Types
- Centralize frontend enums and type definitions in the `frontend/src/types/` directory.
- Avoid using raw string literals for roles. Always use the `UserRole` enum defined in [index.ts](file:///c:/Users/Bhara/Desktop/HELPDESK/frontend/src/types/index.ts) (possessing values `ADMIN` and `AGENT`) when assigning or checking roles.
- Avoid using raw string literals for ticket status and categories. Always use the `TicketStatus` and `TicketCategory` union types (declared via `as const` object value mappings and exported string literal union types in [index.ts](file:///c:/Users/Bhara/Desktop/HELPDESK/frontend/src/types/index.ts)) when checking status, filtering categories, or rendering dropdown select elements.



### Backend Error Handling
- Since we use **Express 4**, manual `try/catch` blocks wrapping async route handlers are **mandatory** to catch and forward rejected promises to the error middleware via `next(err)`. Without `try/catch`, asynchronous errors will result in unhandled promise rejections that crash the Node.js server. Always wrap async controllers in `try/catch` and capture/forward the error.

### Shared Core Package
- Define shared Zod data validation schemas in the `core` package (`core/src/index.ts`).
- Reference this shared package by importing schemas directly from `"core"` inside both client (`frontend`) and server (`backend`) code.
- Backend-specific schema attributes (such as database-only optional fields like `role`) should be appended by extending the core schema using `.extend(...)` in the backend validation file.
