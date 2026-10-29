export function truncate(text, max) {
  const s = String(text ?? '');
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n[truncated ${s.length - max} characters]`;
}

export const firstLine = (s) => String(s ?? '').split('\n')[0].trim();

