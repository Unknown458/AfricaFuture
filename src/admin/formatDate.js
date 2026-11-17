export function formatDate(value) {
  if (!value) return '—';
  const d = typeof value === 'number' ? new Date(value) : new Date(`${value}T00:00:00`);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

