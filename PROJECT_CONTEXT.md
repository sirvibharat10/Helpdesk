# 1. Project Overview

- Project name: SahaYak AI HelpDesk / CRM
- Purpose: Provide an AI-enhanced helpdesk and CRM application that manages tickets, users, email integration, and AI-powered ticket classification and summary generation.
- Tech stack:
  - Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT authentication
  - Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query
  - AI: Google Gemini generative AI via `@google/generative-ai`
  - Email: Resend email service plus Gmail polling placeholder
- Backend architecture:
  - Express server with route modules for auth, tickets, users, settings
  - Middleware for authentication, authorization, and error handling
  - Prisma ORM for data access and schema management
  - Service layer for auth, email, AI, and polling logic
  - Static file serving of frontend build from `frontend/dist`
- Frontend architecture:
  - React SPA with Vite bundler
  - Routing via `react-router-dom`
  - Auth state managed by localStorage and a custom `useAuth` hook
  - API abstraction in `src/lib/api.ts`
  - UI components in `src/components/*`
  - shadcn generated UI button variant in `src/components/ui/button.tsx`
  - Tailwind CSS and shadcn theme integration in `frontend/src/index.css`
- Folder structure:
  - `backend/`: backend code, Prisma schema, routes, services, middleware
  - `frontend/`: React app, Tailwind config, Vite config, generated shadcn config
  - root config: Docker compose, root package manifests, README, `PROJECT_CONTEXT.md`
- Database information:
  - PostgreSQL via Prisma datasource
  - Models: User, Ticket, Reply, KnowledgeBase
  - Relationships: users assigned to tickets, replies attached to tickets and optionally authored by users

# 2. Current Project Status

The project is fully functional and building successfully end-to-end.

- Authentication:
  - Backend login endpoint exists at `/api/auth/login`
  - JWT auth with `authMiddleware` and `adminMiddleware`
  - Frontend stores `auth_token` and `auth_user` in localStorage
  - Protected routes are implemented in `frontend/src/App.tsx`
- Backend APIs:
  - `/api/auth/login`, `/api/auth/me`
  - `/api/tickets` GET (with server-side sorting and filtering), POST
  - `/api/tickets/:id` GET, PATCH, DELETE
  - `/api/tickets/:id/replies` POST
  - `/api/tickets/:id/classify`, `/api/tickets/:id/summarize`, `/api/tickets/:id/suggest-reply` POST
  - `/api/tickets/incoming-email` POST (unauthenticated webhook, secured by `WEBHOOK_SECRET` header)
  - `/api/users` GET, POST, PATCH, DELETE
  - `/api/settings` GET
  - `/api/settings/demo-inquiry` POST
- Frontend types:
  - `UserRole` TypeScript enum in `frontend/src/types/index.ts`
  - `TicketStatus` and `TicketCategory` declared as `as const` objects with exported union types
- Dashboard:
  - `DashboardPage.tsx` displays ticket stats and recent tickets sorted by newest first
- Ticket module:
  - `TicketsPage.tsx` uses TanStack React Table with server-side sorting (click column headers to sort), server-side filtering (`manualFiltering: true`), and server-side pagination (`manualPagination: true`) with a default page size of 10.
  - Ticket detail view is accessed by clicking the Subject link. Row-level clicks do not navigate.
  - `TicketDetailPage.tsx` for ticket details, reply history, AI actions, and sidebar status/category editing
  - Ticket creation dialog and filtering by status, category, date range, search implemented
- User module:
  - `UsersPage.tsx` with admin-only user management (create, edit, delete)
  - Admin rows do not render a delete button (intentional UI decision)
  - Role field is required when creating users
- Database:
  - Seeding includes 100 realistic helpdesk tickets with diverse categories, statuses, and dates via `backend/prisma/seed-tickets.ts` for testing sorting, filtering, and pagination.
- Email ingestion:
  - `POST /api/tickets/incoming-email` accepts support email payloads and creates tickets automatically
  - AI classification is applied on ingestion
  - Source is set to `"EMAIL"` for ingested tickets
  - `EmailSetupPage.tsx` includes a Simulate Support Email panel for admin testing
- E2E testing:
  - Playwright test suites: `e2e/tickets.spec.ts`, `e2e/users.spec.ts`
  - Tests cover ticket ingestion (UI and webhook), user CRUD operations
  - Env vars `WEBHOOK_SECRET` and `API_BASE_URL` are loaded from `backend/.env` via dotenv in test setup
- Pages:
  - Landing, Login, Dashboard, Tickets, TicketDetail, Users, EmailSetup
- Current routing:
  - `/` → Landing or Dashboard depending on auth
  - `/login`
  - `/dashboard`
  - `/tickets`
  - `/tickets/:id`
  - `/users` (admin only)
  - `/email-setup` (admin only)

# 3. Prisma

## Models and relationships

### User

- `id`: String primary key
- `email`: unique String
- `password`: hashed String
- `name`: String
- `role`: Role enum (ADMIN or AGENT)
- `createdAt`, `updatedAt`
- `assignedTickets`: one-to-many relation to Ticket via `assignedTo`
- `replies`: one-to-many relation to Reply

### Ticket

- `id`: String primary key
- `subject`, `body`, `summary`, `suggestedReply`
- `status`: TicketStatus enum
- `category`: TicketCategory enum
- `fromEmail`, `fromName`
- `aiClassified`, `aiResolved`: Booleans
- `source`: TicketSource enum
- `assignedToId`: optional foreign key to User
- `assignedTo`: optional relation to User
- `replies`: one-to-many relation to Reply
- `createdAt`, `updatedAt`

### Reply

- `id`: String primary key
- `body`: Text
- `isAI`: Boolean
- `sentViaEmail`: Boolean
- `ticketId`: FK to Ticket
- `authorId`: optional FK to User
- `ticket`: Ticket relation
- `author`: User relation
- `createdAt`

### KnowledgeBase

- `id`: String primary key
- `title`, `content`, `category`
- `createdAt`, `updatedAt`

### Enums

- Role: `ADMIN`, `AGENT`
- TicketStatus: `NEW`, `OPEN`, `PROCESSING`, `RESOLVED`, `CLOSED`
- TicketCategory: `GENERAL_QUESTION`, `TECHNICAL_QUESTION`, `REFUND_REQUEST`
- TicketSource: `EMAIL`, `MANUAL`

# 4. API Endpoints

## Auth endpoints

- `POST /api/auth/login`
  - request: `{ email, password }`
  - response: `{ token, user: { id, email, name, role } }`
  - purpose: authenticate user and issue JWT
- `GET /api/auth/me`
  - headers: `Authorization: Bearer <token>`
  - response: current user details
  - purpose: validate token and fetch user identity

## Ticket endpoints

- `GET /api/tickets`
  - headers: auth token
  - query params: `status`, `category`, `search`, `dateFrom`, `dateTo`, `page`, `limit`, `sortBy`, `sortOrder`
  - `sortBy` allowed values: `subject`, `fromEmail`, `status`, `category`, `createdAt` (default: `createdAt`)
  - `sortOrder` allowed values: `asc`, `desc` (default: `desc`)
  - response: `{ tickets, pagination }`
  - purpose: list tickets, filter by user role for agents, server-side sorted
- `POST /api/tickets`
  - headers: auth token
  - body: ticket creation payload
  - response: created ticket with replies
  - purpose: create a new ticket
- `GET /api/tickets/:id`
  - headers: auth token
  - response: ticket detail with assigned user and replies
  - purpose: fetch details for one ticket
- `PATCH /api/tickets/:id`
  - headers: auth token
  - body: ticket update fields
  - response: updated ticket
  - purpose: update ticket metadata/status/category
- `DELETE /api/tickets/:id`
  - headers: auth token
  - response: deletion success message
  - purpose: delete a ticket
- `POST /api/tickets/:id/replies`
  - headers: auth token
  - body: `{ body, sentViaEmail }`
  - response: created reply
  - purpose: add a reply to the ticket, optionally send email
- `POST /api/tickets/:id/classify`
  - headers: auth token
  - response: updated ticket after AI classification
  - purpose: classify ticket category using AI
- `POST /api/tickets/:id/summarize`
  - headers: auth token
  - response: updated ticket with summary
  - purpose: generate a ticket summary using AI
- `POST /api/tickets/:id/suggest-reply`
  - headers: auth token
  - response: updated ticket after reply suggestion
  - purpose: generate suggested reply from AI based on knowledge base
- `POST /api/tickets/incoming-email`
  - no auth required; secured by `X-Webhook-Secret` header or valid JWT fallback
  - body: `{ fromEmail, fromName?, subject, body }`
  - response: created ticket
  - purpose: convert incoming support email payloads to tickets, auto-classified by AI

## User endpoints

- `GET /api/users`
  - headers: auth token, admin only
  - response: list of users
  - purpose: admin user management
- `POST /api/users`
  - headers: auth token, admin only
  - body: `{ email, password, name, role }`
  - response: created user profile
  - purpose: create new users and send welcome email
- `PATCH /api/users/:id`
  - headers: auth token, admin only
  - body: update fields, optional password
  - response: updated user
  - purpose: edit user profiles
- `DELETE /api/users/:id`
  - headers: auth token, admin only
  - response: deletion success message
  - purpose: delete users

## Settings endpoints

- `GET /api/settings`
  - headers: auth token, admin only
  - response: config status values
  - purpose: check environment variable setup
- `POST /api/settings/demo-inquiry`
  - body: demo inquiry payload
  - response: success message
  - purpose: send demo inquiry via email service

# 5. Environment Variables

The project currently expects these environment variables:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma
- `JWT_SECRET`: secret used to sign JWT tokens
- `JWT_EXPIRES_IN`: optional token lifetime, default `7d`
- `GEMINI_API_KEY`: Google Gemini API key for AI ticket actions
- `RESEND_API_KEY`: Resend email API key for outbound email
- `RESEND_FROM_EMAIL`: default sender address for outgoing email
- `NOTIFICATION_EMAIL` / `ADMIN_EMAIL`: notification recipient for demo inquiries
- `GMAIL_USER`: Gmail account user for email polling
- `GMAIL_APP_PASSWORD`: Gmail app-specific password for polling
- `SUPPORT_EMAIL`: support email address shown in settings
- `PORT`: backend port, default `3001`
- `WEBHOOK_SECRET`: shared secret used to authenticate calls to `POST /api/tickets/incoming-email` via the `X-Webhook-Secret` header
- `API_BASE_URL`: base URL of the backend API (e.g. `http://localhost:3001`), used by E2E tests

# 6. Database

- database name: not explicit in code, derived from `DATABASE_URL`
- migrations: Prisma migration scripts are not shown, but schema is managed by `prisma` and `db:migrate` scripts
- seed: `backend/prisma/seed.ts` creates admin and agent users, knowledge base articles, sample tickets, and one sample reply. A separate seeder `backend/prisma/seed-tickets.ts` generates 100 realistic, diverse tickets spread across different dates, categories, and statuses.
- sample users:
  - `admin@sahayak.ai` / `admin123` role `ADMIN`
  - `agent@sahayak.ai` / `agent123` role `AGENT`
- sample tickets:
  - "Unable to login to account" assigned to agent
  - "Payment charged twice" assigned to agent with a sample reply
  - "Feature request: export data" unassigned manual ticket
  - 100 additional diverse tickets seeded via `npx tsx prisma/seed-tickets.ts`

# 7. Current Issues

- `emailPollerService` is a placeholder and will not actually poll Gmail until credentials and IMAP logic are implemented.
- AI functionality depends on `GEMINI_API_KEY`; if missing, AI endpoints may return defaults but may log errors.
- `axios` is installed as a frontend dependency but the project uses the `fetch`-based `api.ts` wrapper; axios is unused.

# 8. Pending Tasks

- Implement Gmail IMAP polling in `emailPollerService` for real-world email ingestion
- Add ticket assignment workflows and agent notifications
- Implement real knowledge base search and article management
- Add user profile and password reset flows
- Add audit logs and ticket history tracking
- Harden auth with session expiration handling
- Add proper error boundary pages and frontend loading states

# 9. Codebase Notes

- Design decisions:
  - The backend uses Prisma with PostgreSQL and Express routes separate by domain
  - JWT auth is stateless and stored in localStorage on the frontend
  - The frontend uses a custom `api` wrapper for fetch requests, automatically injecting auth headers
  - shadcn is partially integrated for accessible UI primitives; the project uses token-based styling
  - `TicketStatus` and `TicketCategory` are declared as `as const` objects with exported string literal union types in `frontend/src/types/index.ts` — not as TypeScript enums — for better type ergonomics
  - Admin rows in the user table do not have a delete button (intentional UI decision)
  - Ticket list uses TanStack React Table with `manualSorting: true`, `manualFiltering: true`, and `manualPagination: true` (page size default 10). Sorting state is synced to `sortBy` and `sortOrder`, column filters to `status` and `category` API queries, and page navigation to `page`/`limit`.
  - Reusable `.link` CSS class is defined under `@layer components` in `index.css` for consistent link styling (e.g. subject button/link).
  - Ticket navigation is triggered specifically by clicking the Subject link button on the table, not the whole row.
- Architecture decisions:
  - Frontend and backend are separate packages under the same monorepo
  - Backend serves the frontend build as static files and provides the API under `/api`
  - AI services are abstracted behind `aiService` to allow later swap
  - Email service is abstracted behind `emailService`, with Resend for outbound mail and Gmail polling stubbed
  - Zod validation schemas are shared between backend and frontend via the `core` package (`core/src/index.ts`)
- Libraries used:
  - `@google/generative-ai` for Gemini AI
  - `resend` for email delivery
  - `react-router-dom` for routing
  - `@tanstack/react-table` for the tickets data table with server-side sorting
  - `@tanstack/react-query` for data fetching
  - `@radix-ui/react-dialog` and `@radix-ui/react-select` for UI primitives
  - `class-variance-authority` and `tailwind-merge` for Tailwind class composition
  - `zod` for request/response validation
  - `vite` for frontend bundling
  - `react-hook-form` + `@hookform/resolvers/zod` for form handling
  - `jsonwebtoken` for JWT generation and verification (also used in webhook fallback auth)
  - `playwright` + `dotenv` for E2E testing

# 10. Future Development

- Implement Gmail IMAP polling in `emailPollerService`
- Add missing contact/email reply notifications
- Improve dashboard analytics and ticket filtering UX
- Implement ticket assignment workflows and notifications
- Add real knowledge base search and article management
- Harden auth with refresh tokens or session expiration
- Add proper error boundary pages and frontend loading states
- Implement user profile and password reset flows
- Add audit logs and ticket history tracking

# 11. Dependencies

## Backend dependencies

- `express`: web server framework
- `@prisma/client`: Prisma ORM runtime
- `bcryptjs`: password hashing
- `cors`: cross-origin resource sharing middleware
- `dotenv`: load `.env` variables
- `jsonwebtoken`: JWT generation and verification
- `resend`: email delivery service
- `@google/generative-ai`: Gemini model access
- `zod`: runtime validation for request payloads

## Frontend dependencies

- `react`, `react-dom`: UI library
- `react-router-dom`: client routing
- `axios`: installed but unused; project uses the custom fetch-based `api.ts` wrapper
- `react-hook-form`, `@hookform/resolvers`: form state management and Zod resolver integration
- `lucide-react`: icon library
- `tailwindcss`: CSS utility framework
- `@tailwindcss/postcss`: Tailwind v4 PostCSS plugin
- `postcss`, `autoprefixer`: CSS processing pipeline
- `shadcn`: shadcn UI CLI/runtime support
- `@radix-ui/react-dialog`, `@radix-ui/react-select`: accessible UI primitives
- `class-variance-authority`: class variant utilities for component styling
- `tailwind-merge`: merge Tailwind class names safely
- `tw-animate-css`: animation utilities
- `zod`: schema validation in frontend forms
- `@tanstack/react-table`: headless table library used for ticket listing with server-side sorting
- `@tanstack/react-query`: server state management and query caching
- `core`: shared workspace package for Zod validation schemas

# 12. Important Files

- `frontend/src/main.tsx`: app entry importing global styles and mounting React
- `frontend/src/App.tsx`: route definitions and protected route logic
- `frontend/src/index.css`: Tailwind imports, shadcn CSS import, theme variables, and custom component styles
- `frontend/tailwind.config.js`: Tailwind theme config and content lookup
- `frontend/components.json`: shadcn CLI configuration and aliases
- `frontend/src/components/ui/button.tsx`: shadcn button variant using `border-border`
- `frontend/src/lib/api.ts`: API request wrapper with auth header injection
- `frontend/src/lib/auth.ts`: localStorage auth persistence
- `backend/src/index.ts`: Express app setup, API mount, static file serving
- `backend/src/middleware.ts`: auth and admin middleware plus error handler
- `backend/src/routes/*.ts`: backend route definitions
- `backend/src/services/*.ts`: service layer for auth, AI, email, and polling
- `backend/prisma/schema.prisma`: database schema
- `backend/prisma/seed.ts`: seed data for admin/agent users, tickets, and knowledge base
- `docker-compose.yml`: local development orchestration potentially including database and services

# 13. How to Run

## Install dependencies

- Backend:
  ```bash
  cd backend
  npm install
  ```
- Frontend:
  ```bash
  cd frontend
  npm install
  ```

## Run backend

- From `backend`:
  ```bash
  npm run dev
  ```

## Run frontend

- From `frontend`:
  ```bash
  npm run dev
  ```

## Seed database

- From `backend`:
  ```bash
  npm run db:seed
  ```

## Full development

- Start PostgreSQL and set `DATABASE_URL`
- Run backend and frontend separately
- Ensure `.env` includes `JWT_SECRET`, `GEMINI_API_KEY`, `RESEND_API_KEY`, and other config as needed

# 14. Known Bugs

- `emailPollerService` is a placeholder and will not actually poll Gmail until credentials and IMAP logic are implemented.
- AI functionality depends on `GEMINI_API_KEY`; if missing, AI endpoints may return defaults but may log errors.
- `axios` is installed as a frontend dependency but is not used; the project relies on the custom fetch-based `api.ts`.

# 15. AI Handover

This project is a fully functional React + Vite + TypeScript helpdesk SPA with an Express + Prisma backend. The frontend builds successfully. All previously reported build and configuration issues have been resolved.

**Key conventions to follow:**

- Use `TicketStatus` and `TicketCategory` from `frontend/src/types/index.ts` when checking or rendering status/category values. These are `as const` objects with exported union types — do **not** redeclare them as TypeScript enums.
- Use `UserRole` enum from the same file when assigning or checking user roles.
- Backend validator schemas are centralized in `backend/src/validators.ts`. Shared Zod schemas live in `core/src/index.ts` and should be imported from `"core"`.
- All async route handlers in Express must use `try/catch` with `next(err)` to forward errors to the error middleware.
- The ticket listing endpoint supports `sortBy`, `sortOrder`, filtering, and pagination query params. The frontend uses TanStack React Table with `manualSorting: true`, `manualFiltering: true`, and `manualPagination: true` (default page size 10), and syncs its state to backend API calls.
- Navigation to a ticket details page is triggered strictly by clicking the Subject link button, not the entire table row.
- Link styling should use the reusable `.link` CSS class.
- `POST /api/tickets/incoming-email` is an unauthenticated webhook secured by `X-Webhook-Secret`. A valid JWT is accepted as a fallback to support the admin simulation UI in `EmailSetupPage.tsx`.
- Admin users cannot be deleted from the UI (no delete button rendered for admin rows).
- The `role` field is required when creating users.

**Sample credentials (from seed):**
- `admin@sahayak.ai` / `admin123` (ADMIN)
- `agent@sahayak.ai` / `agent123` (AGENT)

**Ports:**
- Backend: `http://localhost:3001`
- Frontend dev server: `http://localhost:5173`
