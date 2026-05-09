<div align="center">
  <h1>🏏 CricNation</h1>
  <p><strong>A Next-Generation Digital Scoring Platform for Local Cricket</strong></p>
</div>

<br />

## 📖 About The Project

CricNation is a modern, full-stack digital platform designed to elevate local and neighborhood cricket matches to a professional standard. By leveraging a high-performance technology stack, it provides an international broadcasting-level experience directly to your smartphone or desktop. 

Whether you are organizing a multi-team tournament, tracking your personal batting averages over a season, or following a live match from home, CricNation delivers instantaneous updates and deep analytics through a stunning, premium dark-mode interface.

### ✨ Core Features

*   🔴 **Real-Time Live Scoring Engine**: Ball-by-ball updates broadcasted instantly to all connected clients using WebSockets. No refreshing required.
*   📊 **Advanced Player Analytics**: Comprehensive dashboards featuring Worm graphs, Manhattan charts, strike rates, and economy tracking to analyze player performance over time.
*   🏆 **Tournament & Leaderboard Management**: Easily track team standings, tournament brackets, and net run rates across multiple ongoing leagues.
*   📱 **Social Feed Integration**: A community hub where players can discuss matches, share highlight moments, and interact with the broader local cricketing community.
*   🎨 **Premium UI/UX**: A highly polished, responsive "dark-first" interface utilizing glassmorphism and micro-animations for an immersive experience.
*   🔒 **Secure Authentication**: Robust user management and secure login flows powered by NextAuth.

---

## 🏗️ Architecture & Technology Stack

CricNation is built using a modern, type-safe, and highly scalable serverless architecture:

*   **Framework**: [Next.js 14 (App Router)](https://nextjs.org/) - React framework for server-rendered applications and API routes.
*   **API Layer**: [tRPC](https://trpc.io/) - End-to-end typesafe APIs ensuring seamless client-server communication without GraphQL or REST boilerplate.
*   **Database**: [Neon Serverless Postgres](https://neon.tech/) - High-performance PostgreSQL database designed for the cloud.
*   **ORM**: [Prisma](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM for database modeling and migrations.
*   **Real-time Infrastructure**: [Pusher Channels](https://pusher.com/) - High-throughput WebSockets for instant score broadcasting.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) - For rapid, utility-first styling and smooth component animations.
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [React Query](https://tanstack.com/query/latest) - For lightweight client state and intelligent server-state caching.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
*   [npm](https://www.npmjs.com/) (v9+)
*   Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cricnation.git
   cd cricnation
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory based on the provided `.env.example`.
   ```bash
   cp .env.example .env
   ```
   You will need to procure credentials for the following services:
   *   **Neon**: Create a free PostgreSQL database and grab the Connection String.
   *   **Pusher**: Create a Channels app to retrieve your App ID, Key, Secret, and Cluster.
   *   **NextAuth**: Generate a secure 32-byte secret.

4. **Initialize the Database**
   Push the Prisma schema to your connected PostgreSQL database to create the necessary tables.
   ```bash
   npx prisma db push
   ```
   *(Optional) You can explore your database locally using Prisma Studio:*
   ```bash
   npx prisma studio
   ```

5. **Start the Development Server**
   Run the application in development mode with Turbopack enabled:
   ```bash
   npm run dev
   ```

6. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment

CricNation is optimized for deployment on Vercel. 

1. Push your code to a GitHub repository.
2. Import the project into your Vercel dashboard.
3. Add all the environment variables from your `.env` file into the Vercel project settings.
4. Ensure `NEXTAUTH_URL` is set to your actual Vercel production domain.
5. Deploy the application. Vercel will automatically run the production build process (`npm run build`).

*Note: You must still manually run `npx prisma db push` from your local terminal (configured with your production `DATABASE_URL`) to sync the database schema before the app will function properly.*

---

## 📁 Project Structure

```text
cricnation/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── (app)/            # Authenticated application views
│   ├── (auth)/           # Login and registration flows
│   └── api/              # NextAuth and tRPC server handlers
├── components/           # Reusable UI components (Buttons, Inputs, Modals)
│   ├── analytics/        # Recharts visualizations (Worm, Manhattan)
│   └── ui/               # Base design system components
├── prisma/               # Database schema and migrations
├── server/               # tRPC Backend Router Configuration
│   └── routers/          # Specific API routers (Match, Player, Tournament)
└── public/               # Static assets (Images, Icons)
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
