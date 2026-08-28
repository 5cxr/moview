import { Link } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import { posterGradient, posterInitial } from '../utils/poster.js';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.movieId}`} className="movie-card">
      {movie.posterUrl ? (
        <div className="poster">
          <img className="poster-img" src={movie.posterUrl} alt={movie.title} loading="lazy" />
          {movie.reviewCount > 0 && (
            <div className="poster-rating">
              <StarRating rating={movie.avgRating} size="sm" />
            </div>
          )}
        </div>
      ) : (
        <div className="poster" style={{ background: posterGradient(movie.title) }}>
          <span className="poster-initial">{posterInitial(movie.title)}</span>
          {movie.reviewCount > 0 && (
            <div className="poster-rating">
              <StarRating rating={movie.avgRating} size="sm" />
            </div>
          )}
        </div>
      )}
      <h3 className="movie-card-title">{movie.title}</h3>
      <p className="movie-card-meta">{movie.releaseYear} · {movie.genre}</p>
    </Link>
  );
}
