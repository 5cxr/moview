#!/usr/bin/env python3
"""Imports popular movies from TMDB into the local catalog via the live API.

Usage:
    TMDB_API_KEY=your_key python3 scripts/import_tmdb.py [pages]

`pages` (default 4) is how many pages of TMDB's "popular" list to pull,
20 movies per page. Skips titles that already exist in the catalog, so
it's safe to re-run.

Uses only the stdlib (urllib) - no extra pip installs needed.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

TMDB_API = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
API = "http://localhost:8080/api"
IMPORTER_USERNAME = "tmdb-importer"
IMPORTER_PASSWORD = "tmdb-importer-pw1"
IMPORTER_EMAIL = "tmdb-importer@local.test"


def tmdb_get(path, api_key, **params):
    params["api_key"] = api_key
    url = f"{TMDB_API}{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=15) as resp:
        return json.load(resp)


def api_post(path, token, body):
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(body).encode(),
        method="POST",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.load(resp)


def api_post_auth(path, body):
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(body).encode(),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.load(resp)


def get_token():
    try:
        data = api_post_auth("/auth/login", {"username": IMPORTER_USERNAME, "password": IMPORTER_PASSWORD})
        return data["token"]
    except urllib.error.HTTPError:
        data = api_post_auth(
            "/auth/register",
            {"username": IMPORTER_USERNAME, "email": IMPORTER_EMAIL, "password": IMPORTER_PASSWORD},
        )
        return data["token"]


def existing_titles():
    with urllib.request.urlopen(f"{API}/movies", timeout=15) as resp:
        movies = json.load(resp)
    return {m["title"] for m in movies}


def main():
    api_key = os.environ.get("TMDB_API_KEY")
    if not api_key:
        print("set TMDB_API_KEY in the environment first", file=sys.stderr)
        sys.exit(1)

    pages = int(sys.argv[1]) if len(sys.argv) > 1 else 4

    print("fetching genre map...")
    genre_map = {g["id"]: g["name"] for g in tmdb_get("/genre/movie/list", api_key)["genres"]}

    print("fetching popular movies...")
    tmdb_movies = []
    for page in range(1, pages + 1):
        results = tmdb_get("/movie/popular", api_key, page=page)["results"]
        tmdb_movies.extend(results)

    print("logging in importer account...")
    token = get_token()

    print("checking existing catalog...")
    already = existing_titles()

    created = 0
    for m in tmdb_movies:
        title = m.get("title")
        if not title or title in already:
            continue
        already.add(title)

        genre_ids = m.get("genre_ids") or []
        genre = genre_map.get(genre_ids[0], "Unknown") if genre_ids else "Unknown"
        release_date = m.get("release_date") or ""
        release_year = int(release_date[:4]) if release_date[:4].isdigit() else None
        poster_path = m.get("poster_path")
        poster_url = f"{TMDB_IMAGE_BASE}{poster_path}" if poster_path else None

        director = "Unknown"
        try:
            credits = tmdb_get(f"/movie/{m['id']}/credits", api_key)
            for member in credits.get("crew", []):
                if member.get("job") == "Director":
                    director = member["name"]
                    break
        except urllib.error.HTTPError:
            pass

        try:
            api_post(
                "/movies",
                token,
                {
                    "title": title,
                    "genre": genre,
                    "releaseYear": release_year,
                    "director": director,
                    "posterUrl": poster_url,
                },
            )
            created += 1
            print(f"  + {title} ({release_year})")
        except urllib.error.HTTPError as e:
            print(f"  ! failed to create {title}: {e}", file=sys.stderr)

        time.sleep(0.05)

    print(f"done. imported {created} new movies.")


if __name__ == "__main__":
    main()
