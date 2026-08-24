import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import MovieForm from '../components/MovieForm.jsx';

export default function MovieDetail() {
  const { movieId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editingMovie, setEditingMovie] = useState(false);
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

  async function handleMovieUpdate(form) {
    await api.put(`/movies/${movieId}`, form);
    setEditingMovie(false);
    load();
  }

  async function handleMovieDelete() {
    if (!window.confirm('Delete this movie and all its reviews?')) return;
    await api.delete(`/movies/${movieId}`);
    navigate('/');
  }

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
      {editingMovie ? (
        <MovieForm initial={movie} onSubmit={handleMovieUpdate} onCancel={() => setEditingMovie(false)} />
      ) : (
        <div className="movie-header">
          <h2>{movie.title} ({movie.releaseYear})</h2>
          <p>{movie.genre} · dir. {movie.director}</p>
          {user && (
            <div className="movie-actions">
              <button onClick={() => setEditingMovie(true)}>Edit movie</button>
              <button onClick={handleMovieDelete}>Delete movie</button>
            </div>
          )}
        </div>
      )}

      <hr />

      <h3>Reviews</h3>

      {user && !myReview && !addingReview && (
        <button onClick={() => setAddingReview(true)}>Write a review</button>
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
        {reviews.length === 0 && <p>No reviews yet - be the first.</p>}
      </div>
    </div>
  );
}
