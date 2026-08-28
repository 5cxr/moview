import { useState } from 'react';
import StarRating from './StarRating.jsx';

const emptyForm = { rating: 5, liked: true, reviewText: '', watchedDate: '' };

export default function ReviewForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? emptyForm);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        ...form,
        rating: Number(form.rating),
        watchedDate: form.watchedDate || null,
      });
    } catch (err) {
      setError(err.response?.data?.message ?? 'something went wrong');
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <label>
        Rating (0-10, half-star steps)
        <input
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={form.rating}
          onChange={(e) => update('rating', e.target.value)}
          required
        />
        <span className="rating-preview">
          <StarRating rating={Number(form.rating) || 0} size="lg" />
        </span>
      </label>

      <label className="liked-toggle">
        <input
          type="checkbox"
          checked={form.liked}
          onChange={(e) => update('liked', e.target.checked)}
        />
        Liked it
      </label>

      <label>
        Watched on
        <input
          type="date"
          value={form.watchedDate ?? ''}
          onChange={(e) => update('watchedDate', e.target.value)}
        />
      </label>

      <label>
        Review
        <textarea
          value={form.reviewText ?? ''}
          onChange={(e) => update('reviewText', e.target.value)}
          rows={4}
        />
      </label>

      <div className="form-actions">
        <button type="submit">Save review</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
