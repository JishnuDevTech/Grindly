# Grindly Frontend

The Grindly frontend is a React single-page application built with Vite and Tailwind CSS. It presents productivity goals as quests, rewards completed work with XP and coins, and includes onboarding, profile, leaderboard, and shop views.

## Setup

```bash
cd frontend
npm install
npm run dev
```

The development server runs at `http://localhost:5173` by default.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.

## Source Layout

- `src/components/` contains reusable UI pieces.
- `src/pages/` contains the main application screens.
- `src/data/mockData.js` contains the current local data model.
- `src/App.jsx` owns page navigation and onboarding state.
