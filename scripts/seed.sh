#!/usr/bin/env bash
# Seeds demo users, movies, and reviews against a running backend (localhost:8080).
# Uses the real API so passwords go through the actual BCrypt path - no
# hardcoded hashes to keep in sync with the app.
set -euo pipefail

API=http://localhost:8080/api

register() {
  local username=$1 email=$2 password=$3
  curl -s -X POST "$API/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$username\",\"email\":\"$email\",\"password\":\"$password\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))"
}

create_movie() {
  local token=$1 title=$2 genre=$3 year=$4 director=$5
  curl -s -X POST "$API/movies" \
    -H "Content-Type: application/json" -H "Authorization: Bearer $token" \
    -d "{\"title\":\"$title\",\"genre\":\"$genre\",\"releaseYear\":$year,\"director\":\"$director\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['movieId'])"
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

echo "adding movies..."
M1=$(create_movie "$ALICE" "Inception" "Sci-Fi" 2010 "Christopher Nolan")
M2=$(create_movie "$ALICE" "Parasite" "Thriller" 2019 "Bong Joon-ho")
M3=$(create_movie "$ALICE" "The Grand Budapest Hotel" "Comedy" 2014 "Wes Anderson")

echo "adding reviews..."
create_review "$ALICE" "$M1" 9.5 true "Mind bending, rewatched twice." "2026-08-10"
create_review "$BOB"   "$M1" 8.0 true "Great but overlong." "2026-08-12"
create_review "$BOB"   "$M2" 10.0 true "Perfect film, no notes." "2026-08-15"
create_review "$ALICE" "$M3" 8.5 true "Visually gorgeous." "2026-08-18"

echo "done. demo logins: alice/demo1234, bob/demo1234"
