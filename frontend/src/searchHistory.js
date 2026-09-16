const MAX_ENTRIES = 10;

function storageKey(userId) {
  return `bailanysta_search_history_${userId || "guest"}`;
}

export function getSearchHistory(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSearchHistoryEntry(userId, query) {
  const trimmed = query.trim();
  if (!trimmed) return getSearchHistory(userId);

  const existing = getSearchHistory(userId).filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}

export function clearSearchHistory(userId) {
  localStorage.removeItem(storageKey(userId));
}
