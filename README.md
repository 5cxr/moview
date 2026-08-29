# Moview

A small Letterboxd-style movie review app. Browse the movie catalog, log the ones you've watched with a click-to-rate star picker (half-star precision), mark liked/not liked, and see other users' reviews. The catalog itself is curated (imported from TMDB) rather than user-editable - there's no "add a movie" flow in the UI.

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

## Demo data-

With the backend running, seed some users/movies/reviews through the real API (so passwords go through the actual BCrypt path):

```bash
./scripts/seed.sh
```

Creates demo logins `Harsh` / `demo1234` and `Sarthak` / `demo1234`, three movies, and a handful of reviews.

## Movie catalog (TMDB import)

The catalog is populated from [TMDB](https://www.themoviedb.org/)'s popular-movies list, not hand-entered. To (re)populate it:

1. Get a free TMDB API key at https://www.themoviedb.org/settings/api.
2. With the backend running:

```bash
TMDB_API_KEY=your_key_here python3 scripts/import_tmdb.py [pages]
```

`pages` (default 4) is how many pages of TMDB's popular list to pull, 20 movies per page. Safe to re-run - it skips titles already in the catalog and logs in as (or creates) a dedicated `tmdb-importer` account rather than reusing your own. Uses only the Python stdlib, no extra installs.

Movies added this way get a real poster (TMDB CDN); anything added without a poster URL (e.g. the seed script's demo movies) falls back to a generated placeholder in the UI.

## Project layout

```
backend/   Spring Boot API (controller -> service -> repository -> MySQL)
frontend/  React SPA (pages, components, axios API client)
scripts/   seed.sh - demo users/reviews, import_tmdb.py - catalog import
```
