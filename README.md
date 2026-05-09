<div align="center">

<br/>

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/tRPC-11-398CCB?style=for-the-badge&logo=trpc&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel&logoColor=white" />

<br/><br/>

# 🏏 CricNation

**The professional digital scoring platform for local cricket.**  
Live scores · Player analytics · Tournament management · Community feed

<br/>

[**→ Live Demo**](https://cricnation.vercel.app) &nbsp;·&nbsp; [**Report a Bug**](https://github.com/Naman-1508/CricNation/issues) &nbsp;·&nbsp; [**Request a Feature**](https://github.com/Naman-1508/CricNation/issues)

<br/>

</div>

---

## 🎯 What is CricNation?

CricNation brings a professional broadcasting experience to neighborhood cricket matches. Whether you're scoring a friendly tape-ball game in your colony or organizing a full leather-ball tournament, CricNation gives you the tools that international cricket deserves — ball-by-ball scoring, real-time live updates, deep player analytics, and a social community hub.

**No subscription. No ads. 100% free.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Live Ball-by-Ball Scoring** | Real-time score updates via WebSockets. No refresh needed — every boundary and wicket broadcasts instantly to all viewers. |
| 🏆 **Tournament Management** | Create brackets, manage fixtures, auto-calculate points tables and NRR. Supports all formats. |
| 📊 **Player Analytics** | Career stats, batting averages, bowling economy, strike rates, Worm graphs, and Manhattan charts. |
| 👤 **Player Profiles** | Each player gets a full stats card, performance percentages, wagon wheel visualization, and achievement badges. |
| 🌐 **Social Community Feed** | Post match highlights, react to cricket moments, and engage with your local cricket community. |
| 📱 **Progressive Web App** | Install CricNation on any phone like a native app. Works offline for basic viewing. |
| 🔒 **Secure Authentication** | Phone number OTP login. No passwords. Powered by NextAuth.js v5. |
| 🌍 **Auto Location Detection** | Detects your city automatically so you see matches near you first. |

---

## 🛠️ Tech Stack

```
Frontend        → Next.js 16 (App Router) + React 18 + Framer Motion + Recharts
Styling         → Tailwind CSS + Glassmorphism design system
API Layer       → tRPC v11 (100% type-safe, zero boilerplate)
Database        → Neon Serverless PostgreSQL + Prisma ORM
Authentication  → NextAuth.js v5 (Phone OTP flow)
Real-time       → Pusher Channels (WebSocket live scoring)
Media           → Cloudinary (player avatars, ground images)
State           → Zustand (client) + TanStack Query (server)
Deployment      → Vercel (Edge Network)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **v18+**
- npm **v9+**
- Git

### 1. Clone & Install

```bash
git clone https://github.com/Naman-1508/cricnation.git
cd cricnation
npm install
```

### 2. Environment Setup

Copy the example env file:
```bash
cp .env.example .env
```

Fill in your credentials for these services:

| Service | Purpose | Free Tier |
|---|---|---|
| [Neon](https://neon.tech) | PostgreSQL Database | 500 MB |
| [Pusher](https://pusher.com) | Live Scoring WebSockets | 200k messages/day |
| [Cloudinary](https://cloudinary.com) | Image Uploads | 25 GB |

### 3. Database Setup

```bash
npx prisma db push     # Push schema to your database
npx prisma studio      # (Optional) Visual database explorer
```

### 4. Run Locally

```bash
npm run dev            # Starts at http://localhost:3000
```

---

## 📁 Project Structure

```
cricnation/
│
├── app/
│   ├── (app)/                  # Main authenticated app shell
│   │   ├── page.tsx            # Home — Live matches + Quick actions
│   │   ├── layout.tsx          # Bottom nav + FAB layout
│   │   ├── score/
│   │   │   ├── page.tsx        # Match setup wizard
│   │   │   └── [matchId]/      # Live scoring interface
│   │   ├── tournaments/        # Tournament list + detail view
│   │   ├── leaderboard/        # Season rankings with podium
│   │   ├── social/             # Community feed + post creation
│   │   └── profile/[id]/       # Player card + analytics
│   │
│   ├── (auth)/
│   │   └── login/              # Phone OTP authentication flow
│   │
│   ├── api/
│   │   ├── trpc/[trpc]/        # tRPC HTTP handler
│   │   └── auth/[...nextauth]/ # NextAuth.js handler
│   │
│   └── _trpc/                  # tRPC client configuration
│
├── server/
│   ├── index.ts                # Root tRPC router
│   ├── trpc.ts                 # Procedure helpers + context
│   └── routers/
│       ├── match.ts            # Match CRUD + scoring logic
│       ├── tournament.ts       # Tournament + leaderboard
│       └── player.ts           # Player stats + social feed
│
├── components/
│   ├── analytics/              # Recharts-based visualizations
│   │   ├── ManhattanChart.tsx
│   │   └── WormGraph.tsx
│   └── ui/                     # Reusable design system components
│
├── prisma/
│   └── schema.prisma           # Database models
│
└── public/                     # Static assets + PWA manifest
```

---

## 🌐 Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: initial production release"
   git push origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project → Import your repository
   - Framework preset: **Next.js** (auto-detected)

3. **Add Environment Variables**  
   In Vercel Project Settings → Environment Variables, add all keys from `.env.example` with your real values.

4. **Deploy & Sync DB**
   ```bash
   # Run once after first deploy, with production DATABASE_URL in your local .env
   npx prisma db push
   ```

---

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=                        # Neon Postgres connection string

# Authentication
NEXTAUTH_SECRET=                     # 32-byte random secret
NEXTAUTH_URL=                        # Your production URL (skip on Vercel)

# Real-time
NEXT_PUBLIC_PUSHER_APP_KEY=          # Pusher public key
NEXT_PUBLIC_PUSHER_CLUSTER=          # Pusher cluster region (e.g., ap2)
PUSHER_APP_ID=                       # Pusher app ID
PUSHER_SECRET=                       # Pusher secret key

# Media
CLOUDINARY_URL=                      # Full Cloudinary URL
```

---

## 📄 License

MIT License — free to use, fork, and modify.

---

<div align="center">
  <p>Built with ❤️ for cricket lovers across India 🇮🇳</p>
  <p>
    <a href="https://cricnation.vercel.app">🌐 Live App</a> &nbsp;·&nbsp;
    <a href="https://github.com/Naman-1508/CricNation/issues">🐛 Issues</a> &nbsp;·&nbsp;
    <a href="https://github.com/Naman-1508/CricNation/pulls">🤝 Contribute</a>
  </p>
</div>
