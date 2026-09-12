# Grindly

Grindly is a Life RPG productivity app: real work becomes timed quests, meaningful effort earns validated progression, and consistency becomes visible.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Lucide React, Firebase Auth
- Backend: FastAPI, SQLAlchemy, Python Reward Engine
- Database: MySQL in production, SQLite fallback for local development
- Auth: Firebase email/password, Google, GitHub, and phone verification

## Local setup

### 1. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` with the Firebase Web App values from Firebase Console. Enable Email/Password, Google, GitHub, and Phone providers under Authentication. Add `localhost` to authorized domains.

### 2. Backend

```bash
cd backend
/usr/local/bin/python3 -m pip install -r requirements.txt
/usr/local/bin/python3 -m uvicorn app.main:app --app-dir . --reload --port 8000
```

Copy the root `.env.example` to `backend/.env` and set `DATABASE_URL`. For MySQL use `mysql+pymysql://user:password@localhost:3306/grindly`. Without Firebase service-account configuration, development-only `Authorization: Bearer dev-token` is available for local API testing; production rejects it.

For Firebase server verification, set `FIREBASE_SERVICE_ACCOUNT_JSON` to the service-account JSON as a single environment value. Never commit it.

### 3. Database

MySQL deployments can apply `database/schema.sql`. The backend automatically creates SQLAlchemy tables for local development.

## Quest security model

Rewards are never calculated or granted by the browser:

```text
create quest
  -> start server session
  -> server clock tracks elapsed time
  -> complete request
  -> backend validates ownership, state, timer, and duplicate claim
  -> Python Reward Engine calculates capped XP, coins, attributes, and anti-spam multiplier
  -> database stores the trusted result
```

Task duration is bounded from 5 minutes to 8 hours. Rewards use diminishing scaling, difficulty, priority, category, streak, and daily completion count. Completing a quest before its required session time returns `TIMER_NOT_SATISFIED`; claiming twice returns a conflict.

## API

The backend exposes protected endpoints under `/api` for profile, quest CRUD/start/complete, leaderboard, shop inventory, and purchases. `/api/health` is public.

## Validation

```bash
npm --prefix frontend run build
PYTHONPATH=backend python3 -c "from app.main import app; print(app.title)"
```
