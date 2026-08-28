// Displays a 0-10 rating as 5 stars (half-star precision) via a clipped overlay - no icon library needed.
export default function StarRating({ rating, outOf10 = true, size = 'md' }) {
  const value = outOf10 ? rating / 2 : rating;
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <span className={`stars stars-${size}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className="stars-track">★★★★★</span>
      <span className="stars-fill" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}
