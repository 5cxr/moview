#!/usr/bin/env bash
# Seeds demo users and reviews against a running backend (localhost:8080).
# Uses the real API so passwords go through the actual BCrypt path - no
# hardcoded hashes to keep in sync with the app.
#
# Movies are NOT created here - the catalog comes from scripts/import_tmdb.py.
# Run that first (or make sure the catalog already has movies) before this.
set -euo pipefail

API=http://localhost:8080/api

register() {
  local username=$1 email=$2 password=$3
  local token
  token=$(curl -s -X POST "$API/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$username\",\"email\":\"$email\",\"password\":\"$password\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
  if [ -z "$token" ]; then
    # already registered - log in instead so the script can be re-run safely
    token=$(curl -s -X POST "$API/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
      | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
  fi
  echo "$token"
}

create_review() {
  local token=$1 movie_id=$2 rating=$3 liked=$4 text=$5 watched=$6
  curl -s -X POST "$API/reviews" \
    -H "Content-Type: application/json" -H "Authorization: Bearer $token" \
    -d "{\"movieId\":$movie_id,\"rating\":$rating,\"liked\":$liked,\"reviewText\":\"$text\",\"watchedDate\":\"$watched\"}" \
    > /dev/null
}

echo "registering demo users..."
ALICE=$(register alice alice@demo.com demo1234)
BOB=$(register bob bob@demo.com demo1234)

echo "picking movies from the existing catalog..."
MOVIE_IDS=$(curl -s "$API/movies" | python3 -c "
import json, sys
movies = json.load(sys.stdin)
if len(movies) < 3:
    sys.exit('catalog has fewer than 3 movies - run scripts/import_tmdb.py first')
print(' '.join(str(m['movieId']) for m in movies[:3]))
")
read -r M1 M2 M3 <<< "$MOVIE_IDS"

echo "adding reviews..."
create_review "$ALICE" "$M1" 9.5 true "Mind bending, rewatched twice." "2026-08-10"
create_review "$BOB"   "$M1" 8.0 true "Great but overlong." "2026-08-12"
create_review "$BOB"   "$M2" 10.0 true "Perfect film, no notes." "2026-08-15"
create_review "$ALICE" "$M3" 8.5 true "Visually gorgeous." "2026-08-18"

echo "done. demo logins: alice/demo1234, bob/demo1234"
