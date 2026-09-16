const LOCALES = { ru: "ru-RU", kk: "kk-KZ", en: "en-US" };

export function formatTime(iso, language) {
  return new Date(iso).toLocaleTimeString(LOCALES[language] || "ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
    return `${t("time.yesterday")}, ${formatTime(iso, language)}`;
  }

  const locale = LOCALES[language] || "ru-RU";
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(
    locale,
    sameYear ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" }
  );
}
