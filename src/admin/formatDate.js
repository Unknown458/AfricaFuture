export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const str = value.trim();
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const d = new Date(`${str}T00:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }
    const cleaned = str.replace(/\.(\d{3})\d+/, '.$1');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
    const rawD = new Date(str);
    if (!isNaN(rawD.getTime())) return rawD;
  }
  return null;
}

export function formatDate(value, options = {}) {
  const d = parseDate(value);
  if (!d) return '—';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(options.includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    ...options,
  };
  delete defaultOptions.includeTime;

  try {
    return d.toLocaleDateString(undefined, defaultOptions);
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatDateTime(value) {
  const d = parseDate(value);
  if (!d) return '—';
  try {
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d.toLocaleDateString();
  }
}
