import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import StarRating from '../components/StarRating.jsx';
import { posterGradient, posterInitial } from '../utils/poster.js';

export default function MovieDetail() {
  const { movieId } = useParams();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null); // review object or null
  const [addingReview, setAddingReview] = useState(false);

  useEffect(() => {
    load();
  }, [movieId]);

  async function load() {
    const [movieRes, reviewsRes] = await Promise.all([
      api.get(`/movies/${movieId}`),
      api.get(`/reviews/movie/${movieId}`),
    ]);
    setMovie(movieRes.data);
    setReviews(reviewsRes.data);
  }

  const myReview = user ? reviews.find((r) => r.username === user.username) : null;

  async function handleReviewCreate(form) {
    await api.post('/reviews', { ...form, movieId: Number(movieId) });
    setAddingReview(false);
    load();
  }

  async function handleReviewUpdate(form) {
    await api.put(`/reviews/${editingReview.reviewId}`, { ...form, movieId: Number(movieId) });
    setEditingReview(null);
    load();
  }

  async function handleReviewDelete(reviewId) {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/reviews/${reviewId}`);
    load();
  }

  if (!movie) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="movie-header">
        {movie.posterUrl ? (
          <img className="poster" src={movie.posterUrl} alt={movie.title} />
        ) : (
          <div className="poster" style={{ background: posterGradient(movie.title) }}>
            <span className="poster-initial">{posterInitial(movie.title)}</span>
          </div>
        )}
        <div className="movie-info">
          <h2>{movie.title} ({movie.releaseYear})</h2>
          <div className="movie-meta-row">
            <span className="genre-pill">{movie.genre}</span>
            <span className="director">dir. {movie.director}</span>
          </div>
          {movie.reviewCount > 0 && (
            <div className="movie-rating-summary">
              <StarRating rating={movie.avgRating} size="lg" />
              <span className="rating-number">
                {(movie.avgRating / 2).toFixed(1)} ({movie.reviewCount} review{movie.reviewCount === 1 ? '' : 's'})
              </span>
            </div>
          )}
        </div>
      </div>

      <hr />

      <div className="section-heading">
        <h3>Reviews</h3>
        {reviews.length > 0 && <span className="count">{reviews.length}</span>}
      </div>

      {user && !myReview && !addingReview && (
        <button onClick={() => setAddingReview(true)}>Log this movie</button>
      )}
      {addingReview && (
        <ReviewForm onSubmit={handleReviewCreate} onCancel={() => setAddingReview(false)} />
      )}

      {editingReview && (
        <ReviewForm
          initial={editingReview}
          onSubmit={handleReviewUpdate}
          onCancel={() => setEditingReview(null)}
        />
      )}

      <div className="review-list">
        {reviews.map((r) => (
          <ReviewCard
            key={r.reviewId}
            review={r}
            canEdit={user && user.username === r.username && !editingReview}
            onEdit={() => setEditingReview(r)}
            onDelete={() => handleReviewDelete(r.reviewId)}
          />
        ))}
        {reviews.length === 0 && <p className="empty-state">No reviews yet - be the first.</p>}
      </div>
    </div>
  );
}
