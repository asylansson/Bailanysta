import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { search as searchApi } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import { getSearchHistory, addSearchHistoryEntry, clearSearchHistory } from "../searchHistory.js";
import Avatar from "../components/Avatar.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";
import { RowSkeletonList } from "../components/Skeleton.jsx";

export default function SearchPage({ currentUser }) {
  const { t, tp } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("idle");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getSearchHistory(currentUser?.id));
  }, [currentUser]);

  async function runSearch(q) {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const data = await searchApi(trimmed);
      setResults(data);
      setStatus("ready");
      setHistory(addSearchHistoryEntry(currentUser?.id, trimmed));
    } catch {
      setStatus("error");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(query);
  }

  function handleHistoryClick(q) {
    setQuery(q);
    runSearch(q);
  }

  function handleClearHistory() {
    clearSearchHistory(currentUser?.id);
    setHistory([]);
  }

  function handlePersonClick(userId) {
    navigate(`/messages/${userId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative flex items-center justify-center mb-4">
        <BackHomeButton />
        <h1 className="page-title text-xl font-bold tracking-tight text-violet-700 dark:text-violet-300">
          {t("search.title")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          autoFocus
          className="w-full rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </form>

      {status === "idle" && (
        <>
          {history.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("search.recent")}</h2>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  {t("search.clearHistory")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleHistoryClick(q)}
                    className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{t("search.prompt")}</p>
          )}
        </>
      )}

      {status === "loading" && <RowSkeletonList count={4} />}

      {status === "ready" && results && (
        <div className="space-y-6">
          {results.users.length === 0 && results.communities.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">{t("search.noResults")}</p>
          )}

          {results.users.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("search.people")}</h2>
              <div className="space-y-2">
                {results.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handlePersonClick(u.id)}
                    className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors text-left"
                  >
                    <Avatar name={u.name} picture={u.picture} presetId={u.avatarPreset} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                      {u.nickname && <p className="text-xs text-gray-400 truncate">{u.nickname}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.communities.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("search.communitiesSection")}</h2>
              <div className="space-y-2">
                {results.communities.map((c) => (
                  <Link
                    key={c.id}
                    to={`/communities/${c.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                  >
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.memberCount} {tp("communities.members", c.memberCount)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
