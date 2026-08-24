import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.movieId}`} className="movie-card">
      <h3>{movie.title}</h3>
      <p>{movie.releaseYear} · {movie.genre}</p>
      <p className="director">dir. {movie.director}</p>
    </Link>
  );
}
