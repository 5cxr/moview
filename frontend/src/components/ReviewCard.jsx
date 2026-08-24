export default function ReviewCard({ review, canEdit, onEdit, onDelete }) {
  return (
    <div className="review-card">
      <div className="review-header">
        <strong>{review.username}</strong>
        <span className="rating">{review.rating}/10</span>
        <span className="liked">{review.liked ? '♥ liked' : 'not liked'}</span>
      </div>
      {review.watchedDate && <p className="watched-date">watched {review.watchedDate}</p>}
      {review.reviewText && <p className="review-text">{review.reviewText}</p>}
      {canEdit && (
        <div className="review-actions">
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}
