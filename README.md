# ElevateCRM — AI-Powered Customer & Sales Intelligence Platform

A production-grade AI-powered CRM SaaS platform built with Next.js, Express, MongoDB, Redis, and Claude AI.

![ElevateCRM](https://img.shields.io/badge/ElevateCRM-AI%20Powered-22d3ee?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge)

---

## Stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| UI       | shadcn/ui, Framer Motion, Recharts                |
| State    | TanStack Query, Zustand                           |
| Backend  | Node.js, Express.js, TypeScript                   |
| Database | MongoDB Atlas, Mongoose                           |
| Cache    | Redis (ioredis)                                   |
| AI       | Anthropic Claude API (claude-sonnet-4-6)          |
| Auth     | JWT (access + refresh tokens)                     |

---

## Project Structure

```
ElevateCRM/
├── backend/                    # Express API
│   └── src/
│       ├── config/             # DB, Redis, env config
│       ├── controllers/        # Route handlers
│       ├── middleware/         # Auth, error, validation
│       ├── models/             # Mongoose schemas
│       ├── redis/              # Cache & rate limiter
│       ├── routes/             # Express routers
│       ├── services/           # AI service (Claude)
│       ├── utils/              # JWT, response helpers
│       └── validations/        # Zod schemas
│
├── frontend/                   # Next.js app
│   ├── app/
│   │   ├── (auth)/             # Login, Register
│   │   └── (dashboard)/        # Protected routes
│   ├── components/
│   │   ├── ai/                 # AI components
│   │   ├── dashboard/          # Charts, stats
│   │   ├── layout/             # Sidebar, Header
│   │   ├── leads/              # Lead management
│   │   ├── pipeline/           # Kanban board
│   │   └── common/             # Toaster, etc.
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # API client, utils
│   ├── store/                  # Zustand auth store
│   └── types/                  # TypeScript types
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Redis server (local or Upstash)
- Anthropic API key

### 1. Clone & Install

```bash
git clone https://github.com/your-org/elevatecrm.git
cd elevatecrm

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:3000
Backend API: http://localhost:5000

---

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=min-32-char-secret
JWT_REFRESH_SECRET=min-32-char-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
AI_RATE_LIMIT_WINDOW_MS=900000
AI_RATE_LIMIT_MAX=50
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## API Endpoints

### Authentication

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Leads

```
GET    /api/v1/leads
POST   /api/v1/leads
GET    /api/v1/leads/:id
PATCH  /api/v1/leads/:id
DELETE /api/v1/leads/:id
GET    /api/v1/leads/kanban
PATCH  /api/v1/leads/:id/status
GET    /api/v1/leads/:leadId/notes
POST   /api/v1/leads/:leadId/notes
```

### AI

```
POST /api/v1/ai/summarize    # Lead summary
POST /api/v1/ai/email        # Email generation
GET  /api/v1/ai/insights     # Sales insights
POST /api/v1/ai/chat         # AI assistant
```

### Dashboard

```
GET /api/v1/dashboard/stats
GET /api/v1/dashboard/analytics
```

---

## AI Features

1. **Lead Summary** — Paste client notes → AI generates summary, sentiment, urgency, and next action
2. **Email Generator** — Generate follow-up, cold outreach, meeting reminder, or proposal emails
3. **Sales Insights** — Analyze CRM data for hot leads, inactive clients, and conversion tips
4. **AI Assistant** — Chat-style interface for real-time CRM queries

All AI powered by Claude claude-sonnet-4-6 via Anthropic API with Redis caching.

---

## Redis Usage

| Use Case          | TTL              |
| ----------------- | ---------------- |
| Dashboard stats   | 5 minutes        |
| Lead list queries | 60 seconds       |
| AI response cache | 5 minutes        |
| Sales insights    | 10 minutes       |
| Token blacklist   | 15 minutes       |
| AI rate limiting  | 15-minute window |

---

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api.render.com/api/v1
```

### Backend (Render)

1. Connect GitHub repository
2. Set root directory to `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all environment variables

### Database

- MongoDB Atlas: Free M0 tier → Production M10+
- Redis: Use Upstash for serverless Redis

---

## Security Features

- JWT access tokens (15min) + refresh tokens (7 days)
- Token blacklist via Redis on logout
- Role-based access control (admin/sales/user)
- Helmet.js security headers
- CORS with allowlist
- AI endpoint rate limiting via Redis
- Zod input validation on all endpoints
- bcryptjs password hashing (12 rounds)

---

## License

MIT
