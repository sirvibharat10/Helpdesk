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

The project is partially implemented and wired end-to-end but currently blocked by frontend build issues.

- Authentication:
  - Backend login endpoint exists at `/api/auth/login`
  - JWT auth with `authMiddleware` and `adminMiddleware`
  - Frontend stores `auth_token` and `auth_user` in localStorage
  - Protected routes are implemented in `frontend/src/App.tsx`
- Backend APIs:
  - `/api/auth/login`
  - `/api/auth/me`
  - `/api/tickets` GET, POST
  - `/api/tickets/:id` GET, PATCH, DELETE
  - `/api/tickets/:id/replies` POST
  - `/api/tickets/:id/classify` POST
  - `/api/tickets/:id/summarize` POST
  - `/api/tickets/:id/suggest-reply` POST
  - `/api/users` GET, POST, PATCH, DELETE
  - `/api/settings` GET
  - `/api/settings/demo-inquiry` POST
- Prisma models:
  - User
  - Ticket
  - Reply
  - KnowledgeBase
  - Enums: Role, TicketStatus, TicketCategory, TicketSource
- Database setup:
  - `backend/prisma/schema.prisma`
  - `backend/prisma/seed.ts`
  - `backend/package.json` scripts for `db:push`, `db:migrate`, `db:studio`, `db:seed`
- Dashboard:
  - `frontend/src/pages/DashboardPage.tsx` exists and displays ticket stats and recent tickets
- Ticket module:
  - Ticket listing in `frontend/src/pages/TicketsPage.tsx`
  - Ticket detail view in `frontend/src/pages/TicketDetailPage.tsx`
  - Ticket creation dialog and filtering implemented
- User module:
  - `frontend/src/pages/UsersPage.tsx` with admin-only user management
  - Backend user CRUD endpoints implemented
- AI integration:
  - `backend/src/services/aiService.ts` uses `@google/generative-ai` Gemini model
  - Ticket classify, summarize, suggest reply endpoints implemented
- Email integration:
  - `backend/src/services/emailService.ts` uses `resend` for outgoing email
  - `backend/src/services/emailPollerService.ts` contains Gmail polling placeholder logic
  - `/api/settings/demo-inquiry` endpoint exists for demo inquiry notification
- Components created:
  - `Button`, `Badge`, `Dialog`, `Input`, `Textarea`, `Layout`
  - shadcn button variant in `src/components/ui/button.tsx`
- Pages completed:
  - Landing, Login, Dashboard, Tickets, TicketDetail, Users, EmailSetup
- Utilities:
  - `frontend/src/lib/api.ts` handles API requests and auth headers
  - `frontend/src/lib/auth.ts` handles login state and localStorage
  - `frontend/src/lib/utils.ts` exports `cn`, and currently has placeholder format helpers
- Current routing:
  - `/` -> Landing or Dashboard depending on auth
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
  - query params: `status`, `category`, `search`, `dateFrom`, `dateTo`, `page`, `limit`
  - response: `{ tickets, pagination }`
  - purpose: list tickets and filter by user role for agents
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

# 6. Database

- database name: not explicit in code, derived from `DATABASE_URL`
- migrations: Prisma migration scripts are not shown, but schema is managed by `prisma` and `db:migrate` scripts
- seed: `backend/prisma/seed.ts` creates admin and agent users, knowledge base articles, sample tickets, and one sample reply
- sample users:
  - `admin@sahayak.ai` / `admin123` role `ADMIN`
  - `agent@sahayak.ai` / `agent123` role `AGENT`
- sample tickets:
  - "Unable to login to account" assigned to agent
  - "Payment charged twice" assigned to agent with a sample reply
  - "Feature request: export data" unassigned manual ticket

# 7. Current Issues

## Tailwind CSS issue

- `frontend/tailwind.config.js` was previously customized incorrectly and later overwritten, leaving only a default config.
- Tailwind v4 plugin setup is being used but the `tailwind.config.js` file does not define the required token colors needed for shadcn utilities.

## shadcn configuration

- `frontend/components.json` exists and points to a shadcn setup, but the current `tailwind.config.js` is not matching the generated shadcn theme.
- `frontend/src/index.css` imports `shadcn/tailwind.css` and contains `@apply` lines that depend on custom shadcn theme utilities.

## border-border error

- The `border-border` class is being used by the shadcn button variant and in `frontend/src/index.css`.
- Tailwind currently does not know how to resolve this class because the theme token `border` is not configured in `tailwind.config.js`.
- The presence of `@apply border-border` inside `index.css` indicates shadcn expects token-based classes.

## frontend build issues

- The frontend fails to build with `npm run build` due to the `border-border` utility being unknown.
- `frontend/tailwind.config.js` is currently not properly configured for production-grade shadcn + Tailwind v4 integration.
- A prior attempt to upgrade dependencies changed `tailwind.config.js` back to default and may have disrupted the config.

## broken pages

- No explicit page-level errors are known beyond the build failure.
- Functional issues may exist in pages that depend on AI or email configuration, but the main blocker is styling/build.

## other issues

- `frontend/src/lib/utils.ts` had missing export functions for `formatDate` and `formatDateTime`, which blocked `npm run build` after the Tailwind fix.
- `shadcn-ui` dependency remains in `frontend/package.json` though the project is using `shadcn@4.x`, creating potential confusion.

# 8. Pending Tasks

- Fix `frontend/tailwind.config.js` to define all shadcn token colors and enable `darkMode: ["class"]`
- Ensure `frontend/src/index.css` includes the proper `@layer base` block and theme CSS variables for shadcn
- Resolve `border-border` utility generation and verify Tailwind builds successfully
- Remove or reconcile stale `shadcn-ui` dependency if not needed
- Confirm `frontend/components.json` matches actual component/theme config
- Check if `shadcn/tailwind.css` path is valid and imported correctly
- Run `npm install` in `frontend` after config fix
- Rebuild frontend with `npm run build`
- Verify all routes and pages render in development
- Ensure AI endpoints are protected and functional
- Validate email sending only if `RESEND_API_KEY` and required env vars are configured
- Confirm `emailPollerService` behavior or remove placeholder logic if unused

# 9. Codebase Notes

- Design decisions:
  - The backend uses Prisma with PostgreSQL and Express routes separate by domain
  - JWT auth is stateless and stored in localStorage on the frontend
  - The frontend uses a custom `api` wrapper for fetch requests, automatically injecting auth headers
  - shadcn is partially integrated and has generated a UI button variant; the project appears to use token-based styling
- Architecture decisions:
  - Frontend and backend are separate packages under the same monorepo
  - Backend serves the frontend build as static files and provides the API under `/api`
  - AI services are abstracted behind `aiService` to allow later swap
  - Email service is abstracted behind `emailService`, with Resend for outbound mail and Gmail polling stubbed
- Libraries used:
  - `@google/generative-ai` for Gemini AI
  - `resend` for email delivery
  - `react-router-dom` for routing
  - `@radix-ui/react-dialog` and `@radix-ui/react-select` for UI primitives
  - `class-variance-authority` and `tailwind-merge` for Tailwind class composition
  - `zod` for request/response validation
  - `vite` for frontend bundling

# 10. Future Development

- Fix Tailwind/shadcn build and stabilize all theme tokens
- Add missing contact/email reply notifications and Gmail polling
- Improve dashboard analytics and ticket filtering UX
- Implement ticket assignment workflows and notifications
- Add real knowledge base search and article management
- Harden auth with refresh tokens or session expiration
- Add proper error boundary pages and frontend loading states
- Add test coverage for backend routes and frontend pages
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
- `axios`: HTTP requests? actually the project uses fetch; axios is installed but not necessarily used
- `react-hook-form`, `@hookform/resolvers`: form state management and validation integration
- `lucide-react`: icon library
- `tailwindcss`: CSS utility framework
- `@tailwindcss/postcss`: Tailwind v4 PostCSS plugin
- `postcss`, `autoprefixer`: CSS processing pipeline
- `shadcn`: shadcn UI CLI/runtime support
- `shadcn-ui`: legacy shadcn dependency, likely stale
- `@radix-ui/react-dialog`, `@radix-ui/react-select`: accessible UI primitives
- `class-variance-authority`: class variant utilities for component styling
- `tailwind-merge`: merge Tailwind class names safely
- `tw-animate-css`: animation utilities
- `zod`: schema validation in frontend forms

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

- `border-border` utility is not generated because Tailwind config is incomplete and not exposing theme tokens required by shadcn.
- `frontend` build currently fails with a PostCSS error from `@apply border-border`.
- `frontend/tailwind.config.js` was overwritten and does not contain the previously attempted theme customizations.
- `frontend/src/lib/utils.ts` was missing expected helper exports used by pages.
- `shadcn-ui` dependency remains in `frontend/package.json` even though the app uses `shadcn@4.x`; this creates dependency confusion.
- `emailPollerService` is a placeholder and will not actually poll Gmail until credentials and IMAP logic are implemented.
- AI functionality depends on `GEMINI_API_KEY`; if missing, AI endpoints may return defaults but may still log errors.

# 15. AI Handover

This project is a React + Vite + TypeScript app with an Express + Prisma backend. The frontend is currently blocked by Tailwind/shadcn configuration issues, specifically the `border-border` utility used by the shadcn button component and base CSS.

Do not remove Tailwind classes like `border-border` or `outline-ring`; those classes are expected by the shadcn theme and must be enabled through proper Tailwind theme configuration. Do not change the existing API route definitions or page routing unless necessary for fixes.

Primary fix order:

1. Restore proper `frontend/tailwind.config.js` so theme tokens like `border`, `input`, `ring`, `background`, and `foreground` are defined.
2. Confirm `frontend/src/index.css` loads `shadcn/tailwind.css` and defines CSS variables in a `@layer base` block.
3. Ensure `@tailwindcss/postcss` and `tailwindcss` versions are compatible and installed.
4. Rebuild frontend with `npm run build`.

Once the styling build is fixed, verify that the backend routes and auth flow are operational using sample credentials from the seed file.

The backend is functional for login, ticket management, user CRUD, AI actions, and demo email inquiries, but email polling is not implemented. The `backend` serves the frontend build and exposes API routes under `/api`.

The document above is the current snapshot of the repository state and should be used as the single source of truth for continuing development.
