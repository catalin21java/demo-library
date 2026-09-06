# Demo Library

A full-stack library web app for browsing books, saving favourites, and managing the catalogue with role-based admin access.

**Stack:** React + Vite · Node.js + Express · SQLite · JWT auth

---

## Preview

<img width="625" height="384" alt="Demo Library books list UI" src="https://github.com/user-attachments/assets/3dd0992c-3e57-4b88-a5d0-3585f4ed7942" />

---

## Features

| Area | What you can do |
| --- | --- |
| Public browse | Open the home page without logging in; search, sort, filter by rating, paginate |
| Book details | Open any book by id |
| Auth | Sign up / log in with JWT stored in `localStorage` |
| Favourites | Signed-in users can star books and filter the list to favourites only |
| Admin catalogue | Admins create, update rating/fields, and delete books |
| Admin approvals | Users can request admin; existing admins approve pending accounts |

---

## System architecture

<p align="center">
  <img src="docs/figures/architecture-overview.png" alt="System architecture: React frontend, Express API, SQLite" width="900" />
</p>

```mermaid
flowchart TB
  subgraph Frontend["Frontend — React + Vite"]
    UI[Pages & components]
    CTX[Auth / Books / Favourites providers]
    RR[React Router]
  end

  subgraph Backend["Backend — Express"]
    AUTH["/api/auth"]
    BOOKS["/api/books"]
    FAV["/api/favourites"]
    ADM["/api/admin"]
  end

  DB[(SQLite<br/>app.sqlite)]

  UI --> CTX --> RR
  RR -->|JWT Bearer| AUTH
  RR -->|public GET / JWT for writes| BOOKS
  RR -->|JWT| FAV
  RR -->|JWT + admin| ADM
  AUTH --> DB
  BOOKS --> DB
  FAV --> DB
  ADM --> DB
```

**Layered backend:** `routes → controllers → services → repositories → SQLite`

---

## Data model

<p align="center">
  <img src="docs/figures/data-model.png" alt="ER diagram: users, books, user_favourites" width="900" />
</p>

```mermaid
erDiagram
  users ||--o{ user_favourites : saves
  books ||--o{ user_favourites : favourited_by

  users {
    int id PK
    text username UK
    text password_hash
    text role "admin | user | pending_admin"
    datetime created_at
  }

  books {
    int id PK
    text title
    text author
    int published_year
    int rating
    int is_favourite
    datetime created_at
  }

  user_favourites {
    int user_id PK,FK
    int book_id PK,FK
  }
```

---

## Auth & roles

<p align="center">
  <img src="docs/figures/auth-roles-flow.png" alt="Signup, login, and role capabilities" width="720" />
</p>

```mermaid
flowchart TD
  A[Signup] -->|role = user| U[user]
  A -->|request admin| P[pending_admin]
  L[Login] --> JWT[JWT issued]
  JWT --> R{role?}
  R -->|user| U
  R -->|pending_admin| P
  R -->|admin| AD[admin]
  P -->|approved by admin| AD

  U --> U1[Browse & details]
  U --> U2[Favourites]
  AD --> A1[Book CRUD]
  AD --> A2[Approve pending admins]
```

Default seeded admin (change after first login): `admin` / `admin123`

---

## API map

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | — | Optional admin request → `pending_admin` |
| `POST` | `/api/auth/login` | — | Returns JWT |
| `GET` | `/api/books` | — | List books |
| `GET` | `/api/books/:id` | — | Book details |
| `POST` | `/api/books` | Admin | Create book |
| `PATCH` | `/api/books/:id` | Admin | Update fields |
| `DELETE` | `/api/books/:id` | Admin | Delete book |
| `GET` | `/api/favourites` | User | My favourites |
| `POST` | `/api/favourites/:bookId` | User | Add favourite |
| `DELETE` | `/api/favourites/:bookId` | User | Remove favourite |
| `GET` | `/api/admin/pending-admins` | Admin | List pending |
| `POST` | `/api/admin/pending-admins/:id/approve` | Admin | Approve |

---

## App routes (frontend)

```mermaid
flowchart LR
  H["/"] --> Home[Home — public browse]
  BD["/books/:id"] --> Details[Book details]
  LI["/login"] --> Login
  SU["/signup"] --> Signup
  BL["/books"] --> List[Authenticated list + favourites]
  PA["/admin/pending"] --> Pending[Admin approvals]
```

---

## Project layout

```
demo-library/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── pages/     # Home, books, auth, admin
│       ├── components/
│       ├── context/   # Auth, books cache, favourites
│       └── api/
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── config/    # DB + auth
│   └── data/          # SQLite file
└── docs/figures/      # Architecture & model diagrams
```

---

## Quick start

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Optional: seed sample books with `npm run seed` in `backend/`.

---

## Figures index

| Figure | File |
| --- | --- |
| System architecture | [`docs/figures/architecture-overview.png`](docs/figures/architecture-overview.png) |
| Data model (ER) | [`docs/figures/data-model.png`](docs/figures/data-model.png) |
| Auth & roles flow | [`docs/figures/auth-roles-flow.png`](docs/figures/auth-roles-flow.png) |
