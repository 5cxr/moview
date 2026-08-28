# CineLog

A small Letterboxd-style movie review app. Log movies you've watched, rate them 0-10 (half-star precision), mark liked/not liked, and browse other users' reviews.

- **Backend:** Spring Boot (REST API, JWT auth, layered architecture)
- **Frontend:** React (Vite)
- **Database:** MySQL

## Prerequisites

- Java 17+, Maven
- Node 18+
- MySQL running locally

## Backend

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`. On startup it auto-creates the `moview` database and tables (`spring.jpa.hibernate.ddl-auto=update`).

Config lives in `backend/src/main/resources/application.properties`, all overridable via env vars:

| Var | Default | Notes |
|---|---|---|
| `DB_PORT` | `3306` | MySQL port |
| `DB_USERNAME` | `root` | |
| `DB_PASSWORD` | `root` | |
| `JWT_SECRET` | dev-only default | override for anything beyond local dev |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | |

If your local MySQL runs on a non-default port, e.g.:

```bash
DB_PORT=3307 mvn spring-boot:run
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`, proxies API calls to `http://localhost:8080`.

## Demo data

With the backend running, seed some users/movies/reviews through the real API (so passwords go through the actual BCrypt path):

```bash
./scripts/seed.sh
```

Creates demo logins `alice` / `demo1234` and `bob` / `demo1234`, three movies, and a handful of reviews.

## Project layout

```
backend/   Spring Boot API (controller -> service -> repository -> MySQL)
frontend/  React SPA (pages, components, axios API client)
scripts/   seed.sh - demo data via live API
```
