const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const dayFmt = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });

export const formatCompact = (n) => compact.format(n ?? 0);
export const formatTime = (iso) => timeFmt.format(new Date(iso));

export function timeAgo(iso, now = Date.now()) {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const steps = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, secs] of steps) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return 'just now';
}

export function dayLabel(iso, now = new Date()) {
  const d = new Date(iso);
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(now) - start(d)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return dayFmt.format(d);
}

