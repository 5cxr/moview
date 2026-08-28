import StarRating from './StarRating.jsx';

export default function ReviewCard({ review, canEdit, onEdit, onDelete }) {
  return (
    <div className="review-card">
      <div className="review-header">
        <span className="avatar">{review.username[0].toUpperCase()}</span>
        <span className="review-username">{review.username}</span>
        <StarRating rating={review.rating} />
        <span className="rating-number">{review.rating}/10</span>
        <span className={`liked-heart ${review.liked ? 'is-liked' : ''}`}>{review.liked ? '♥' : '♡'}</span>
      </div>
      {review.watchedDate && <p className="watched-date">watched {review.watchedDate}</p>}
      {review.reviewText && <p className="review-text">{review.reviewText}</p>}
      {canEdit && (
        <div className="review-actions">
          <button className="btn-secondary" onClick={onEdit}>Edit</button>
          <button className="btn-danger" onClick={onDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}
