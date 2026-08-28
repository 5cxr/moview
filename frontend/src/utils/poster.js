// Deterministic "poster" look generated from the title - no image API needed.
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function posterGradient(title = '') {
  const hash = hashString(title);
  const hue = hash % 360;
  const hue2 = (hue + 40) % 360;
  return `linear-gradient(150deg, hsl(${hue}, 55%, 28%), hsl(${hue2}, 60%, 14%))`;
}

export function posterInitial(title = '') {
  const trimmed = title.trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}
