# Dozyo

> Tiny steps. Real progress.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas/database)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## Overview

Dozyo is a frictionless productivity coach designed to help students and early-career professionals overcome procrastination by breaking down their tasks into ultra-simple micro-steps, nudging them at the right moments, and eventually turning distraction into a point of re-engagement via mobile.

## Features

### 🧠 Frictionless Task Entry
- One-line freeform task input
- GPT-assisted micro-task breakdown (e.g., "Open doc," "Write 1 sentence")
- Intuitive UI with warm, encouraging design

### ⚡ Smart Nudges
- Optional "nudging hours" (user selects preferred time window)
- GPT-generated motivational micro-prompts
- Web notifications for gentle reminders

### 🔁 Micro-Task Tracker
- Check off small steps to build momentum
- "Next micro-task" always visible and achievable in < 2 minutes
- Encouraging confetti/message after each step

### 📊 Streaks & Soft Gamification
- Gentle streak tracker (no guilt for missing a day)
- Daily "Just Do One" prompt
- Small motivational badges (e.g., "3-Day Streak," "First Step!")

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS, Framer Motion
- **Auth & Storage**: MongoDB Atlas (email + password auth via custom API)
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT API (task breakdown, motivational nudges)
- **Notifications**: Web Push API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB instance)
- OpenAI API key (for GPT features)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/dozyo.git
cd dozyo
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/app                  # Next.js App Router pages and layouts
  /api                # API routes for tasks, auth, and streaks
  /dashboard          # Main application dashboard
/components           # React components
  /ui                 # UI components (buttons, cards, etc.)
/hooks                # Custom React hooks
/lib                  # Utility functions and shared logic
/public               # Static assets
/styles               # Global styles
```

## Design Philosophy

Dozyo follows a "warm coach" approach to productivity, with:
- Warm, pastel color palette
- Rounded corners and soft shadows
- Friendly, encouraging microcopy
- Smooth animations and transitions
- Quicksand font for approachable feel

## Phase 2 (Mobile App)

Future plans include:
- Background detection of common distraction apps (YouTube, Instagram)
- Subtle intervention: "Want to earn 1 point? Do one micro-task first?"
- Instant rewards (confetti, sound, XP) for redirecting effort
- Offline-first task completion tracking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or feedback, please reach out at [contact@dozyo.varunj.dev](mailto:contact@dozyo.varunj.dev) or visit [dozyo.varunj.dev](https://dozyo.varunj.dev).
