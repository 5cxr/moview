import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import StarRating from '../components/StarRating.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import { posterGradient, posterInitial } from '../utils/poster.js';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await api.get('/reviews/mine');
    setReviews(data);
  }

  async function handleUpdate(form) {
    await api.put(`/reviews/${editingReview.reviewId}`, { ...form, movieId: editingReview.movieId });
    setEditingReview(null);
    load();
  }

  async function handleDelete(reviewId) {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/reviews/${reviewId}`);
    load();
  }

  return (
    <div className="page">
      <h2>My films</h2>
      <p className="page-subtitle">Every movie you've logged - rated, liked, or reviewed.</p>

      {editingReview && (
        <ReviewForm initial={editingReview} onSubmit={handleUpdate} onCancel={() => setEditingReview(null)} />
      )}

      <div className="logged-grid">
        {reviews.map((r) => (
          <div key={r.reviewId} className="logged-card">
            <Link to={`/movies/${r.movieId}`}>
              {r.moviePosterUrl ? (
                <img className="poster logged-poster" src={r.moviePosterUrl} alt={r.movieTitle} />
              ) : (
                <div className="poster logged-poster" style={{ background: posterGradient(r.movieTitle) }}>
                  <span className="poster-initial">{posterInitial(r.movieTitle)}</span>
                </div>
              )}
            </Link>

            <div className="logged-info">
              <Link to={`/movies/${r.movieId}`} className="movie-link">
                {r.movieTitle}{r.movieReleaseYear ? ` (${r.movieReleaseYear})` : ''}
              </Link>

              <div className="review-header">
                <StarRating rating={r.rating} />
                <span className="rating-number">{r.rating}/10</span>
                <span className={`liked-heart ${r.liked ? 'is-liked' : ''}`}>{r.liked ? '♥' : '♡'}</span>
              </div>

              {r.watchedDate && <p className="watched-date">watched {r.watchedDate}</p>}
              {r.reviewText && <p className="review-text">{r.reviewText}</p>}

              {!editingReview && (
                <div className="review-actions">
                  <button className="btn-secondary" onClick={() => setEditingReview(r)}>Edit</button>
                  <button className="btn-danger" onClick={() => handleDelete(r.reviewId)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="empty-state">You haven't logged anything yet.</p>}
      </div>
    </div>
  );
}
