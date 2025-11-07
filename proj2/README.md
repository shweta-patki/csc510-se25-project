# 🏃‍♂️ BrickyardBytes

> CSC510: Software Engineering, Fall 2025  
> **Team 5:** Anmol Koul · Arnav Mejari · Om Kumar Singh · Shweta Patki  

BrickyardBytes is a campus-oriented, student-run alternative to Grubhub.  
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
Initial Installation:
```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom
```

Once testing is set up:
```bash
npx vitest run --coverage
```
> We’ll use **Vitest + React Testing Library** for component and route testing.

---


## 🧾 Tech Stack
- ⚛️ React (Vite)
- 🧭 React Router DOM
- 📦 NPM + ES Modules
- 🧪 Vitest

---
## 🆔 Identity and naming

- Project name: BrickyardBytes
- Decision date: 2025-11-06

Uniqueness checks (completed 2025-11-06)
- No exact-name conflicts found in basic registry searches (GitHub, npm, PyPI, Docker Hub)

Trademark checks (completed 2025-11-06)
- USPTO TESS: no exact-name matches found for “BrickyardBytes”; no confusingly similar marks observed in IC 9 and 42 based on a basic search (non‑legal review)
- Campus marks: we avoid using NC State proprietary names/marks (e.g., Wolfpack, Tuffy, Talley, Brickyard) as brand identifiers; our name does not imply affiliation

Disclaimer
- This project is for educational purposes and is not affiliated with or endorsed by North Carolina State University. All trademarks and campus names remain the property of their respective owners.

---
## 📦 Release History

- **v0.4.1** – Enhanced Food Run logic and added GitHub Actions CI workflow  
- **v0.4.0** – Added Points system, PIN verification, and redesigned Profile page  
- **v0.3.1** – Updated frontend comments, cleaned codebase, and minor refactors  
- **v0.3.0** – Implemented ordering and run logic; major backend refactor with new endpoints  
- **v0.2.0** – Added Navbar, Footer, split Home/Broadcast pages, and live run updates  
- **v0.1.0** – Initial prototype with React (Vite) + FastAPI integration and login/register flow

---

## 📸 Demo
https://drive.google.com/file/d/1nYsvlyniUr3Ro5wnOGo4IbAHK5FIFBCo/view?usp=drive_link

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
- Auth
	- POST /auth/register { email, password } -> { user: { id, username, points }, token }
	- POST /auth/login { email, password } -> { user: { id, username, points }, token }
	- GET  /auth/me (Bearer) -> { id, username, points }

- Runs (Bearer)
	- POST /runs { restaurant, drop_point, eta, capacity? } -> FoodRunResponse
	- GET  /runs -> [FoodRunResponse]
	- GET  /runs/available -> other users’ active runs with seats_remaining > 0
	- GET  /runs/joined -> runs you have joined
	- GET  /runs/mine -> runs created by you
	- GET  /runs/joined/history -> joined runs that are completed/cancelled
	- GET  /runs/mine/history -> your runs that are completed/cancelled
	- POST /runs/{run_id}/orders { items, amount } -> OrderResponse (join a run)
	- DELETE /runs/{run_id}/orders/me -> cancel your order (unjoin)
	- DELETE /runs/{run_id}/orders/{order_id} -> runner removes a user's order
	- PUT /runs/{run_id}/complete -> mark run completed and award points
	- PUT /runs/{run_id}/cancel -> cancel your run

	FoodRunResponse includes: id, runner_id, runner_username, restaurant, drop_point, eta, capacity, status, seats_remaining, orders (in /runs/mine)
	OrderResponse: id, run_id, user_id, status, items, amount, user_email

- Points (Bearer)
	- GET  /points -> { points, points_value }
	- POST /points/redeem -> redeem in $5 per 10 points increments

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

## 🛠️ Badges

[![CI Tests](https://github.com/shweta-patki/csc510-se25-project/actions/workflows/ci.yml/badge.svg)](https://github.com/shweta-patki/csc510-se25-project/actions/workflows/ci.yml)  
![Frontend Coverage](frontend/frontend-coverage-badge.svg)  
![Backend Coverage](backend/backend-coverage-badge.svg)  
![License](https://img.shields.io/github/license/shweta-patki/csc510-se25-project)


---

## 🧾 License
MIT License © 2025 Team 5, NC State University
