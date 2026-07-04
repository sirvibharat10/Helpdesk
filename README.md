# SahaYak AI - Helpdesk/CRM Application

A full-stack AI-powered helpdesk and CRM web application built with modern technologies.

## Features

- **AI-Powered Ticket Management**: Automatic classification, summarization, and reply suggestions
- **Gmail Integration**: Automatic email polling and ticket creation
- **Real-time Collaboration**: Team communication and ticket assignment
- **Role-Based Access**: Admin and Agent roles with different permissions
- **Email Sending**: Transactional emails via Resend
- **Analytics**: Ticket metrics and performance tracking

## Tech Stack

### Backend

- Node.js 20 + TypeScript
- Express.js REST API
- Prisma ORM with PostgreSQL
- JWT authentication
- Google Gemini 2.5 Flash API
- Resend for email

### Frontend

- React 18 + TypeScript
- Vite build tool
- React Router v6
- TanStack Query
- Tailwind CSS
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository>
cd sahayak-ai
```

2. Install dependencies:

```bash
npm install
cd backend && npm install && cd ../frontend && npm install && cd ..
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

5. Start development servers:

```bash
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Demo Credentials

**Admin:**

- Email: `admin@sahayak.ai`
- Password: `admin123`

**Agent:**

- Email: `agent@sahayak.ai`
- Password: `agent123`

## Environment Variables

See `.env.example` for all required environment variables.

### Key Variables:

- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `GMAIL_USER` & `GMAIL_APP_PASSWORD`: Gmail IMAP credentials
- `RESEND_API_KEY`: Email sending service
- `JWT_SECRET`: Secret for token generation

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tickets

- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/:id/replies` - Add reply
- `POST /api/tickets/:id/classify` - AI classify
- `POST /api/tickets/:id/summarize` - AI summarize
- `POST /api/tickets/:id/suggest-reply` - AI suggest reply

### Users (Admin only)

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Settings

- `GET /api/settings` - Get settings
- `POST /api/settings/demo-inquiry` - Send demo inquiry

## Database Schema

See `backend/prisma/schema.prisma` for the complete schema.

### Models:

- `User` - Team members
- `Ticket` - Support tickets
- `Reply` - Ticket replies/comments
- `KnowledgeBase` - FAQ articles

## Docker Deployment

Build and run with Docker:

```bash
docker-compose up
```

Or build a single container:

```bash
docker build -t sahayak-ai .
docker run -p 3001:3001 sahayak-ai
```

## Features in Detail

### AI Features

- **Classification**: Automatically categorize tickets
- **Summarization**: Generate concise ticket summaries
- **Reply Suggestions**: Draft AI-powered responses
- **Email Polling**: Auto-create tickets from emails

### Email Integration

- Gmail IMAP polling every 30 seconds
- Automatic ticket creation from emails
- AI-powered classification
- Reply sending via Resend

### Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Environment variable configuration

## Development

### Project Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── validators.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── App.tsx
│   └── package.json
└── package.json
```

## Troubleshooting

### Database Issues

```bash
# Reset database
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Gmail Polling Not Working

- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env`
- Enable 2-Step Verification in Google Account
- Generate App Password (not your regular password)

### API Errors

Check server logs:

```bash
cd backend
npm run dev
```

## License

MIT

## Support

For support, contact: contact@sahayak.ai
