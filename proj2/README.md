# 🏃‍♂️ BrickYard Bites (Name WIP)

> CSC510: Software Engineering, Fall 2025  
> **Team 5:** Anmol Koul · Arnav Mejari · Om Kumar Singh · Shweta Patki  

BrickYard Bites is a campus-oriented, student-run alternative to Grubhub.  
Students already getting food from on-campus spots can **broadcast** their run so others can **attach** orders to it — saving time, cost, and reducing delivery load.

---

## 🗂️ Folder Structure
```
proj2/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env              
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── routes/
│       └── services/
└── backend/
	├── requirements.txt
	├── .env.example
	└── app/
		├── main.py
		├── auth.py
		├── db.py
		├── models.py
		└── schemas.py
```

## 🚀 Quick Start (Frontend + Backend)

Prereqs
- Node.js 20.19+ or 22.12+ (for Vite 7)
- Python 3.10+ (FastAPI backend)

Open two terminals.

Frontend (Terminal A)
```bash
cd csc510-se25-project/proj2/frontend
npm install
npm run dev
```
App will be at http://localhost:5173

Backend (Terminal B)
```bash
cd csc510-se25-project/proj2/backend
python -m venv .venv
# PowerShell
.\.venv\Scripts\Activate.ps1
# bash/WSL
# source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
uvicorn app.main:app --port 5050
```
API will be at http://localhost:5050 (docs: http://localhost:5050/docs)

Frontend env (proj2/frontend/.env)
```bash
VITE_API_BASE=http://localhost:5050
```
Restart Vite if you change .env.


---

## 🧩 Frontend Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Start local development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run test` | Run all unit tests (Vitest) |

---

## 🧪 Testing (coming soon)
Once testing is set up:
```bash
npm run test
```
> We’ll use **Vitest + React Testing Library** for component and route testing.

---

## 🎨 Styling (Tailwind to be added later)
We will integrate **TailwindCSS** in a later milestone (Week 4).  
Current layout uses basic inline styles to keep things simple during development.

---


## 🧾 Tech Stack
- ⚛️ React (Vite)
- 🧭 React Router DOM
- 📦 NPM + ES Modules
- 🧪 Vitest (planned)
- 🎨 TailwindCSS (planned)

---

## 📸 Demo (coming soon)
`<iframe src="https://www.youtube.com/embed/XXXXX" width="560" height="315"></iframe>`

## 🐍 FastAPI Backend

Minimal FastAPI backend for auth (register/login/JWT) and example protected route. Uses SQLModel with SQLite for local dev.

### Requirements
- Python 3.10+
- (Recommended) Run in WSL if on Windows

### Setup
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

4) Run the server (choose a port, 5050 matches frontend .env above)

```bash
uvicorn app.main:app --port 5050
```

API available at http://localhost:5050 (docs at /docs)

### Endpoints
- POST /auth/register { email, password } -> { user, token }
- POST /auth/login { email, password } -> { user, token }
- GET  /auth/me (Authorization: Bearer <token>) -> { id, username }
- GET  /runs (Authorization: Bearer <token>) -> { runs: [...] }

### Frontend integration
- In `proj2/frontend`, create `.env` with:

```
VITE_API_BASE=http://localhost:5050
```

- Restart Vite dev server, register or login, and you should be redirected to Home.

### Notes
- Database: SQLite file `dev.db` (auto-created). Delete it to reset users.
- Password hashing uses PBKDF2-SHA256 (cross-platform). If you switch to bcrypt on Windows, pin a compatible bcrypt version.
- CORS: set `CORS_ORIGINS` in backend `.env` to include your Vite origin(s), e.g. `http://localhost:5173,http://127.0.0.1:5173`.
- For production: switch `DATABASE_URL` to Postgres, rotate `SECRET_KEY`, add rate limiting & validations, and prefer HTTP-only cookies for tokens.

### Troubleshooting
- Vite error about Node version: install Node 20.19+ or 22.12+.
- Browser "Failed to fetch": backend not running, wrong port in `.env`, or CORS mismatch—check Network tab and `CORS_ORIGINS`.
- 405 Method Not Allowed when browsing /auth/register: it’s POST-only—use the form or Swagger UI.
- Port 5000 access denied on Windows: use an alternate port like 5050 (update frontend `.env`).
- PowerShell cannot activate venv: use `.\.venv\Scripts\python.exe -m uvicorn ...` or `Set-ExecutionPolicy -Scope Process Bypass` temporarily.

---

## 🛠️ Badges (to add once CI is ready)
```
![Build](https://github.com/<your-username>/<repo>/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/<your-username>/<repo>)
![License](https://img.shields.io/github/license/<your-username>/<repo>)
```

---

## 🧾 License
MIT License © 2025 Team 5, NC State University