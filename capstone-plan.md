# Moview — Movie Review Platform

A Letterboxd-style movie review app. Users log movies they've watched, rate them 0–10 (half-star precision), and mark liked/not liked separately from rating.

---

## Tech stack
- **Backend:** Spring Boot (REST API, layered architecture)
- **Frontend:** React.js
- **Persistence:** Spring Data JPA
- **Database:** MySQL

---

## Database schema

**User**
| Column | Type | Notes |
|---|---|---|
| userId | INT, PK, auto-increment | |
| username | VARCHAR | unique |
| email | VARCHAR | unique |
| passwordHash | VARCHAR | never store plaintext |

**Movie**
| Column | Type | Notes |
|---|---|---|
| movieId | INT, PK, auto-increment | |
| title | VARCHAR | |
| genre | VARCHAR | |
| releaseYear | INT | |
| director | VARCHAR | |

**Review** — join table between User and Movie, carries its own attributes (classic many-to-many-with-attributes design)
| Column | Type | Notes |
|---|---|---|
| reviewId | INT, PK, auto-increment | |
| userId | INT, FK → User | |
| movieId | INT, FK → Movie | |
| rating | DECIMAL(3,1) | 0.0–10.0, step 0.5, for half-star precision |
| liked | BOOLEAN | independent of rating |
| reviewText | TEXT | |
| watchedDate | DATE | |

**Constraint:** unique `(userId, movieId)` on Review — one review per user per movie.

**Why this is normalized:** movie details aren't duplicated on every review row, user details aren't duplicated either — each non-key column depends only on its own table's primary key (3NF). Review exists specifically to resolve the many-to-many relationship between User and Movie while carrying review-specific data.

**Join query to demo:**
```sql
SELECT u.username, m.title, r.rating, r.liked, r.reviewText
FROM review r
JOIN user u ON r.userId = u.userId
JOIN movie m ON r.movieId = m.movieId
WHERE m.movieId = 5;
```

---

## Architecture (3-tier)

```
React frontend  →  Controller  →  Service  →  Repository (Spring Data JPA)  →  MySQL
```

- Controller: `@RestController`, exposes `/api/**` endpoints, returns `ResponseEntity<>`
- Service: business logic, validation
- Repository: `JpaRepository` interfaces, no manual SQL needed for basic CRUD

---

## Roles (2 members, vertical split)

- **Member A** — `User` module end-to-end (entity → repo → service → controller → register/login screens), plus the `Review` entity + repository (Review depends on User existing first)
- **Member B** — `Movie` module end-to-end (entity → repo → service → controller → browse/search screens), plus the `Review` UI (star rating input, liked toggle, review form) and the join-query endpoint

Both own `Review` jointly since it's the centerpiece of the DB design — make sure you can both explain it in the viva.

---

## Coding conventions
- Classes: `PascalCase` — `Review`, `ReviewService`
- Variables/methods: `camelCase` — `getReviewsByMovie`
- REST endpoints: noun-plural — `GET /api/movies`, `POST /api/reviews`
- DTOs for request/response, don't expose entities directly
- Javadoc comment above every controller method and class

---

## Timeline (Waterfall)
1. **Requirements** — today: finalize schema above, confirm split
2. **Design** — DB schema + architecture diagram (done, see this doc)
3. **Implementation** — Day 1: entities/repos/services/controllers both modules (test in Postman). Day 2: React CRUD screens
4. **Testing** — Day 3: cross-test each other's module, fix integration bugs (enable `@CrossOrigin` early)
5. **Presentation prep** — Day 4: comments, intro + DB slides, rehearse

**Submission:** group name (max 2) + topic — Monday, 2–5 PM.
