import { useState } from 'react';
import StarRating from './StarRating.jsx';

// Ten half-star click zones over a 5-star display. Rating stays 0-10 internally,
// so each zone bumps it by 1 (half a star).
const SLOTS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(null);
  const display = hover ?? value;

  return (
    <span className="star-picker" onMouseLeave={() => setHover(null)}>
      <StarRating rating={display} size="lg" />
      <span className="star-picker-hitboxes">
        {SLOTS.map((rating) => (
          <button
            key={rating}
            type="button"
            className="star-picker-hitbox"
            aria-label={`Rate ${(rating / 2).toFixed(1)} stars`}
            onMouseEnter={() => setHover(rating)}
            onFocus={() => setHover(rating)}
            onClick={() => onChange(rating)}
          />
        ))}
      </span>
    </span>
  );
}
