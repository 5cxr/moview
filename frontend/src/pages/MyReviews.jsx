import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import ReviewCard from '../components/ReviewCard.jsx';
import ReviewForm from '../components/ReviewForm.jsx';

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
      <h2>My reviews</h2>

      {editingReview && (
        <ReviewForm initial={editingReview} onSubmit={handleUpdate} onCancel={() => setEditingReview(null)} />
      )}

      <div className="review-list">
        {reviews.map((r) => (
          <div key={r.reviewId} className="my-review-entry">
            <Link to={`/movies/${r.movieId}`} className="movie-link">{r.movieTitle}</Link>
            <ReviewCard
              review={r}
              canEdit={!editingReview}
              onEdit={() => setEditingReview(r)}
              onDelete={() => handleDelete(r.reviewId)}
            />
          </div>
        ))}
        {reviews.length === 0 && <p className="empty-state">You haven't reviewed anything yet.</p>}
      </div>
    </div>
  );
}
