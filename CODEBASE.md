# Moview — codebase guide

A small Letterboxd-style movie review app. This doc explains how the pieces fit together, the data model, the request lifecycle, and a couple of non-obvious traps that have already bitten this codebase once. For a bare "how do I start it" quickstart, see [README.md](README.md) — this doc goes deeper.

## Tech stack

- **Backend:** Spring Boot 3 (Java 17), Spring Security (JWT, stateless), Spring Data JPA / Hibernate, MySQL, Maven
- **Frontend:** React 18 (Vite), react-router-dom, axios. Plain CSS (`index.css`) — no CSS framework, no component library, no state-management library beyond React context.
- **External:** TMDB API, used once (via a standalone script) to populate the movie catalog — not called at runtime by the app itself.

No fancy libraries by design — this was an explicit constraint. If you're about to reach for a UI kit, form library, or state manager, that's probably a signal to reconsider rather than a gap to fill.

## Running it

```bash
# backend (port 8080) - needs a local MySQL, see README for DB_PORT/credentials overrides
cd backend && mvn spring-boot:run

# frontend (port 5173)
cd frontend && npm install && npm run dev

# demo users + reviews (backend must be running)
./scripts/seed.sh

# (re)populate the movie catalog from TMDB (backend must be running)
TMDB_API_KEY=your_key python3 scripts/import_tmdb.py
```

Full details, env vars, and the TMDB key setup are in [README.md](README.md).

## Repo layout

```
backend/
  src/main/java/com/moview/
    config/       SecurityConfig - the one place that decides what's public vs authenticated
    controller/   REST endpoints, thin - just calls into service and wraps the result
    service/      business logic: validation, ownership checks, orchestration
    repository/   Spring Data JPA interfaces - queries, including the JOIN FETCH ones (see below)
    security/     JwtUtil (sign/verify), JwtAuthFilter (reads the header), UserDetailsServiceImpl
    model/        JPA entities: User, Movie, Review
    dto/          request/response shapes - entities are never returned directly from controllers
    exception/    custom exceptions + GlobalExceptionHandler (translates them to JSON error bodies)
  src/main/resources/application.properties

frontend/
  src/
    pages/        one component per route: Browse, MovieDetail, MyReviews, Login, Register
    components/   reusable pieces: Navbar, MovieCard, ReviewCard, ReviewForm, StarRating,
                   StarPicker, ProtectedRoute
    context/      AuthContext - the only global state (current user, login/register/logout)
    api/axios.js  one axios instance, attaches the JWT to every request via an interceptor
    utils/poster.js  deterministic gradient+initial generator, used when a movie has no posterUrl
    index.css     the entire stylesheet - CSS custom properties for the palette, no preprocessor

scripts/
  seed.sh          registers demo users, logs some reviews against whatever's already in the catalog
  import_tmdb.py   pulls popular movies from TMDB into the catalog via the live API (stdlib only)
```

## Data model

Three tables, 3NF. `Review` is the join table between `User` and `Movie`, carrying review-specific data rather than being a bare junction table:

| Table | Columns | Notes |
|---|---|---|
| `user` | `user_id` PK, `username` (unique), `email` (unique), `password_hash` | Password is BCrypt-hashed, never stored or returned in plaintext. |
| `movie` | `movie_id` PK, `title`, `genre`, `release_year`, `director`, `poster_url` | Single genre string (not multi-genre). `poster_url` is nullable - see "Posters" below. |
| `review` | `review_id` PK, `user_id` FK, `movie_id` FK, `rating` (DECIMAL 3,1), `liked` (bool), `review_text`, `watched_date` | Unique constraint on `(user_id, movie_id)` - one review per user per movie. No `ON DELETE CASCADE` on the FKs (see gotcha #2 below). |

Rating is stored 0.0–10.0, validated to 0.5 steps (`ReviewService.validateRatingStep`). The frontend's 5-star display divides this by 2.

There's no separate "like" action — liking, rating, and reviewing are all fields on the same `Review` row. "Logging a movie" (the My Films page) means "has a Review row for it." There's currently no way to just like a movie without also giving it a rating.

## Request lifecycle / auth flow

1. **Register/login** (`POST /api/auth/register` or `/login`) → `AuthService` checks credentials (or creates the user with a BCrypt hash), then `JwtUtil.generateToken` signs a JWT (`sub`=username, `userId` claim, `jwt.expiration-ms` lifetime — 24h by default) with a fixed HMAC secret from `application.properties` (`jwt.secret`, override via `JWT_SECRET` env var for anything beyond local dev).
2. Frontend stores `{ token, userId, username }` in `localStorage` (`AuthContext.persist`).
3. Every subsequent axios request goes through `api/axios.js`'s interceptor, which attaches `Authorization: Bearer <token>` if a token is present — unconditionally, whether or not the endpoint actually needs it.
4. On the backend, `JwtAuthFilter` (a `OncePerRequestFilter`, registered before Spring Security's own auth filter) reads that header on *every* request, validates the signature/expiry, and if valid, loads the user via `UserDetailsServiceImpl` and populates the `SecurityContext`. This runs regardless of whether the route is public or protected.
5. `SecurityConfig.filterChain` then decides authorization: `/api/auth/**` is fully open, `GET` to `/api/movies/**` and `/api/reviews/**` is public (browsing doesn't require login), everything else needs a valid authenticated principal.
6. Controllers that need the current user take a Spring `Authentication authentication` parameter and read `authentication.getName()` — that's the username set in step 4.

There's no role/permission system — "authenticated" is the only tier. Any logged-in user can create/edit/delete *movies* (see "Known gaps" below); *review* mutations are ownership-checked in `ReviewService` (`requireOwnership` — throws if `review.getUser().getUsername() != current user`, mapped to 400 by `GlobalExceptionHandler`).

## Two gotchas already hit in this codebase

Both are worth knowing before you go looking for a third one that's actually one of these in disguise.

**1. `/api/reviews/{reviewId}` vs `/api/reviews/mine` path collision.** Spring MVC/Security's path matcher can't tell "mine" (a literal segment) from `{reviewId}` (an unconstrained variable) apart when deciding which HTTP methods are valid for a given URL shape. This used to make `GET /api/reviews/mine` and `DELETE /api/reviews/{id}` fail with an *empty-body 403* — not a 404, not a validation error, just a bare deny that looked exactly like an auth/security-config bug. Fixed by constraining the path variable to digits: `@PutMapping("/{reviewId:[0-9]+}")` / `@DeleteMapping(...)`. If you add a new literal route under `/api/reviews/` or `/api/movies/` that sits at the same path depth as an existing `{id}`-shaped route, you'll hit this again — constrain the id pattern.

**2. Lazy-loaded associations outside the session → the same empty 403.** `spring.jpa.open-in-view=false` means the Hibernate session closes when a repository method returns — there's no lingering session for the controller layer to lazily resolve `@ManyToOne` proxies. Reading a `Review`'s `user`/`movie` fields (which `ReviewResponse`'s constructor does, to expose `username`/`movieTitle`/etc.) after the session's closed throws `LazyInitializationException`. That exception isn't caught by `GlobalExceptionHandler`, so it propagates, Spring Boot's internal `/error` forward re-enters the security filter chain, and *that* gets denied — again surfacing as an empty-body 403 with no stack trace visible to the client. The fix, applied everywhere a `Review` is read for a response: use a `JOIN FETCH` query (`ReviewRepository.findByIdWithJoin`, `findByUserUserId`, `findByMovieIdWithJoin`) instead of a plain `findById`/derived query, so `user` and `movie` come back as real objects, not proxies.

**Rule of thumb:** an empty-body 403 from this API almost never means "check the security config" — check the backend log first for a `LazyInitializationException` or a path-matching ambiguity. A real permission problem returns a proper JSON error body via `GlobalExceptionHandler`.

## Movie catalog

The catalog is **curated, not user-editable from the UI**. There's no "add a movie" button anywhere in the frontend — `Browse` and `MovieDetail` are read-only with respect to movie metadata. The backend's `POST`/`PUT`/`DELETE /api/movies` endpoints still exist and still just require *any* logged-in user (no extra role check) — they're used by `scripts/import_tmdb.py`, not exposed in the UI. If you're tempted to add movie-editing UI back, that's a deliberate product decision to reverse, not an oversight to "fix."

Movies get their poster from TMDB (`posterUrl`, absolute `image.tmdb.org` URL) when imported that way. Movies without one (hand-seeded ones, or anything created before this field existed) fall back to a generated poster: `utils/poster.js` hashes the title into a deterministic gradient + big initial letter, so the grid never shows a blank box.

## Rating / stars

Internally, rating is 0–10 in 0.5 steps. The UI shows 5 stars. `StarRating` (display-only, used on cards/reviews/detail) renders two stacked `★★★★★` strings and clips the colored one to `rating/10 * 100%` width — a pure CSS trick, no discrete steps, works for any decimal.

`StarPicker` (the interactive one, in the review form) is different on purpose: each of the 5 stars is its own fixed-size box containing a glyph *and* its own left/right click zones, so the clickable area and the visible glyph can never drift apart (an earlier version overlaid 10 equal-width flex slices across a letter-spaced text row, and the letter-spacing after the last glyph pushed the rightmost hitbox past where the star visually ended). Clicking snaps to whole-number ratings (1–10, i.e. half-star-of-5 increments) — one unit less precision than the backend technically allows, which is fine; nothing enforces finer input.

## Frontend routing / state

- `App.jsx` — all routes. `/`, `/movies/:movieId`, `/login`, `/register` are public; `/my-reviews` is wrapped in `ProtectedRoute` (redirects to `/login` if `AuthContext`'s `user` is null).
- `AuthContext` is the only global state — just the current user, plus login/register/logout. No Redux/Zustand/etc.; each page fetches its own data with `useEffect` + local `useState`.
- `api/axios.js` — one shared axios instance pointed at `http://localhost:8080/api` (hardcoded, not env-driven — fine for local dev, would need changing for any real deployment).

## Scripts

- **`scripts/seed.sh`** — registers `alice`/`bob` (password `demo1234` both), then logs a couple of reviews against whichever movies already exist in the catalog (picks the first 3 from `GET /api/movies`). Deliberately does *not* create its own movies — it used to (Inception/Parasite/Grand Budapest Hotel), and re-running it would silently reintroduce those placeholder movies after they were removed. If you need it to be more deterministic about which movies it picks, that's a reasonable thing to improve — currently it's "whatever's first."
- **`scripts/import_tmdb.py`** — stdlib-only Python (no pip installs). Pulls N pages of TMDB's `/movie/popular`, resolves genre names and director (needs an extra `/movie/{id}/credits` call per movie) and posts each new one through the authenticated `/api/movies` endpoint as a dedicated `tmdb-importer` account, skipping titles already in the catalog. Needs `TMDB_API_KEY` in the environment — never commit that key to a file; `.gitignore` has `.env*` as a guard if you want to keep it in a local dotfile instead of exporting it each time.

## Known gaps (not oversights — just out of scope so far)

- No automated tests, no CI.
- Movie create/edit/delete endpoints have no ownership/role restriction beyond "logged in" — acceptable because the UI never exposes them to regular users, but worth knowing if you're building an admin surface.
- Single genre per movie (TMDB has one movie → many genres; only the first is kept).
- No pagination anywhere — `GET /api/movies` returns the entire catalog in one response. Fine at ~80 movies, would need addressing at real scale.
- `api/axios.js`'s base URL is hardcoded to `localhost:8080` — there's no build-time env config for pointing at a different backend.
