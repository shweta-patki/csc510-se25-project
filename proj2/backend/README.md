# FastAPI Backend

Minimal FastAPI backend for auth (register/login/JWT) and example protected route. Uses SQLModel with SQLite for local dev.

## Requirements
- Python 3.10+
- (Recommended) Run in WSL if on Windows

## Setup
1) Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows/WSL bash
# On PowerShell: .venv\Scripts\Activate.ps1
```

2) Install dependencies

```bash
pip install -r requirements.txt
```

3) Configure environment

```bash
cp .env.example .env
# then edit .env if needed (SECRET_KEY, CORS_ORIGINS)
```

4) Run the server

```bash
uvicorn app.main:app --reload --port 5000
```

API available at http://localhost:5000

## Endpoints
- POST /auth/register { email, password } -> { user, token }
- POST /auth/login { email, password } -> { user, token }
- GET  /auth/me (Authorization: Bearer <token>) -> { id, username }
- GET  /runs (Authorization: Bearer <token>) -> { runs: [...] }

## Frontend integration
- In `proj2/frontend`, create `.env` with:

```
VITE_API_BASE=http://localhost:5000
```

- Restart Vite dev server, register or login, and you should be redirected to Home.

## Notes
- Database: SQLite file `dev.db` (auto-created). Delete it to reset users.
- For production: switch `DATABASE_URL` to Postgres, rotate `SECRET_KEY`, add rate limiting & validations, and prefer HTTP-only cookies for tokens.
