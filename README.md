# Team Task Manager

A private, invite-only team task management application with role-based access control. Built with **Next.js 16**, **Prisma 7**, **PostgreSQL**, and **shadcn/ui v4**.

## Features

- **Multi-Tenant Workspaces** — each company gets an isolated workspace with a unique invite code
- **Role-Based Access Control** — Admin, Manager, and Employee roles with granular permissions
- **Project Management** — create projects, assign members, track progress
- **Task Tracking** — create, assign, and manage tasks with status workflows (TODO → IN_PROGRESS → DONE)
- **Overdue Detection** — automatic overdue flagging on tasks past their due date
- **Comments** — threaded comments on tasks with real-time updates
- **Responsive Design** — mobile-first layout with collapsible sidebar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | PostgreSQL via Prisma 7 ORM |
| Auth | JWT (HTTP-only cookies) + RBAC middleware |
| UI | shadcn/ui v4 + Tailwind CSS v4 |
| Deployment | Railway |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random 64-byte secret for signing auth tokens |

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"
```

### 3. Push database schema

```bash
npx prisma db push
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the registration page.

## Roles & Permissions

| Permission | Admin | Manager | Employee |
|-----------|:-----:|:-------:|:--------:|
| View all projects | ✅ | Own only | Assigned only |
| Create projects | ✅ | ✅ | ❌ |
| Delete projects | ✅ | Own only | ❌ |
| Create/assign tasks | ✅ | ✅ | ❌ |
| Change task status | ✅ | ✅ | Own tasks |
| Manage members | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |

## Deploy to Railway

1. Push your code to a GitHub repo
2. Go to [railway.com](https://railway.com) → New Project → Deploy from GitHub
3. Add a PostgreSQL service → link it to your app
4. Set environment variables in the Railway dashboard:
   - `DATABASE_URL` — auto-injected when you link the PostgreSQL service
   - `JWT_SECRET` — your generated secret
5. Railway will use `railway.toml` to build and deploy automatically

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (dashboard)/     # Dashboard, Projects, Tasks, Members
│   └── api/             # RESTful API routes
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── dashboard/       # Role-scoped dashboard views
│   ├── projects/        # Project list & detail
│   ├── tasks/           # Task detail & comments
│   └── members/         # Member management table
├── lib/                 # Auth, Prisma, validators, utilities
└── proxy.ts             # Auth middleware (JWT verification)
```

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for a comprehensive step-by-step testing checklist.
