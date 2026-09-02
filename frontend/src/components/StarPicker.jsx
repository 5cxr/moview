import { useState } from 'react';

// Rating stays 0-10 internally (half-star units, 2 per star). Each star is
// its own fixed-size box so the visible glyph and its click zone can't drift
// apart the way they would over a letter-spaced text row.
const STARS = [0, 1, 2, 3, 4];

export default function StarPicker({ value, onChange, size = 'lg' }) {
  const [hover, setHover] = useState(null);
  const display = hover ?? value;
  const starsValue = display / 2;

  return (
    <span className={`star-picker star-picker-${size}`} onMouseLeave={() => setHover(null)}>
      {STARS.map((i) => {
        const fillPct = Math.max(0, Math.min(1, starsValue - i)) * 100;
        const half = i * 2 + 1;
        const full = i * 2 + 2;
        return (
          <span key={i} className="star-picker-cell">
            <span className="star-picker-glyph star-picker-glyph-empty">★</span>
            <span className="star-picker-glyph star-picker-glyph-fill" style={{ clipPath: `inset(0 ${100 - fillPct}% 0 0)` }}>★</span>
            <button
              type="button"
              className="star-picker-hit star-picker-hit-left"
              aria-label={`Rate ${(half / 2).toFixed(1)} stars`}
              onMouseEnter={() => setHover(half)}
              onFocus={() => setHover(half)}
              onClick={() => onChange(half)}
            />
            <button
              type="button"
              className="star-picker-hit star-picker-hit-right"
              aria-label={`Rate ${(full / 2).toFixed(1)} stars`}
              onMouseEnter={() => setHover(full)}
              onFocus={() => setHover(full)}
              onClick={() => onChange(full)}
            />
          </span>
        );
      })}
    </span>
  );
}
