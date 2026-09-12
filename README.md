# Grindly

Grindly is a Life RPG productivity app: real work becomes timed quests, meaningful effort earns validated progression, and consistency becomes visible.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Lucide React, Firebase Auth
- Backend: FastAPI, SQLAlchemy, Python Reward Engine
- Database: PostgreSQL in production, SQLite fallback for local development
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

Copy the root `.env.example` to `backend/.env` and set `DATABASE_URL`. For PostgreSQL use `postgresql+psycopg://user:password@localhost:5432/grindly`. Without Firebase service-account configuration, development-only `Authorization: Bearer dev-token` is available for local API testing; production rejects it.

For Firebase server verification, set `FIREBASE_SERVICE_ACCOUNT_JSON` to the service-account JSON as a single environment value. Never commit it.

### 3. Database

PostgreSQL deployments can apply `database/schema.sql`. The backend automatically creates SQLAlchemy tables for local development.

## Production deployment

The Vercel URL `https://grindly-psi.vercel.app` is the frontend only. Deploy the `backend/` directory separately to Render, Railway, Fly.io, or another Python host. The frontend must use that backend's public HTTPS URL.

### Backend host variables

Set these in the backend hosting dashboard. Do not commit them:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@POSTGRES_HOST:5432/grindly
ENVIRONMENT=production
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account", "project_id":"...", "private_key":"..."}
CORS_ORIGINS=["https://grindly-psi.vercel.app"]
```

Use this backend start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

After deployment, open `https://YOUR-BACKEND-DOMAIN/api/health`. It must return `{"status":"ok"}`. Keep that backend URL for the Vercel setup.

### Vercel environment variables

In Vercel, open **Project → Settings → Environment Variables** and add these for **Production**:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Redeploy after changing any `VITE_` variable because Vite embeds these values during the build.

### Firebase production domain

In Firebase Authentication → Settings → Authorized domains, add:

```text
grindly-psi.vercel.app
```

The backend CORS value must contain the exact frontend origin:

```env
CORS_ORIGINS=["https://grindly-psi.vercel.app"]
```

For local testing, include both local origins as well:

```env
CORS_ORIGINS=["https://grindly-psi.vercel.app","http://localhost:5173","http://127.0.0.1:5173"]
```

If Render does not preserve the service-account JSON cleanly, create a base64 value locally without printing it:

```bash
base64 -i ~/Downloads/your-firebase-service-account.json | tr -d '\\n' | pbcopy
```

Add the clipboard value to Render as `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`. Use this instead of `FIREBASE_SERVICE_ACCOUNT_JSON`; never add both.

Never put the Firebase service-account JSON in Vercel. It belongs only in the backend host's secret variables. The Firebase Web API key can be present in the frontend bundle, but provider settings and backend token verification still protect the application.

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
