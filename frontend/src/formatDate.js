function pad2(n) {
  return String(n).padStart(2, "0");
}

// Hand-rolled instead of toLocaleTimeString/toLocaleDateString: browser ICU
// data doesn't reliably support short month names or 24h-vs-12h conventions
// for every locale (kk-KZ in particular falls back to an ugly "M09" instead
// of a month name), so relying on it gives a different look per language.
// A fixed numeric format looks identical - and stays readable - everywhere.
export function formatTime(iso) {
  const date = new Date(iso);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function isSameCalendarDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// "5 min ago" / "3 hours ago" for recent items, "Yesterday, 14:32" for yesterday,
// then a plain "Sep 15" (or "Sep 15, 2025" if not this year) for anything older -
// the same escalating scheme used by most social apps, so a glance at a post or
// message tells you roughly how old it is without doing date arithmetic yourself.
export function formatRelativeTime(iso, language, t, tp) {
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);

  if (diffMin < 1) return t("time.justNow");
  if (diffMin < 60) return tp("time.minutesAgo", diffMin);

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24 && isSameCalendarDay(date, now)) return tp("time.hoursAgo", diffHour);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) {
    return `${t("time.yesterday")}, ${formatTime(iso)}`;
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  const dayMonth = `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}`;
  return sameYear ? dayMonth : `${dayMonth}.${date.getFullYear()}`;
}
