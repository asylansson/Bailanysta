import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchConversations } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import Avatar from "../components/Avatar.jsx";
import NewMessageModal from "../components/NewMessageModal.jsx";
import PeopleSuggestionsModal from "../components/PeopleSuggestionsModal.jsx";
import { PostSkeletonList } from "../components/Skeleton.jsx";
import { formatRelativeTime } from "../formatDate.js";

const elegantButtonClass =
  "px-3 py-1 rounded-full border border-violet-300 dark:border-violet-700 text-xs font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors";

export default function MessagesPage({ currentUser }) {
  const { t, tp, language } = useI18n();
  const [rows, setRows] = useState([]);
  const [hasAnyConversations, setHasAnyConversations] = useState(null);
  const [status, setStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showFindPeople, setShowFindPeople] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    setStatus("loading");
    fetchConversations({ q: query })
      .then((data) => {
        if (!cancelled) {
          setRows(data);
          if (!query.trim()) setHasAnyConversations(data.length > 0);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [currentUser, query]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-gray-500 dark:text-gray-400">{t("profileGate.subtitle")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative flex items-center justify-center mb-4">
        <h1 className="page-title text-xl font-bold tracking-tight text-violet-700 dark:text-violet-300">
          {t("messages.title")}
        </h1>
        <button onClick={() => setShowFindPeople(true)} className={`absolute left-0 ${elegantButtonClass}`}>
          {t("messages.findPeople")}
        </button>
        <button onClick={() => setShowNewMessage(true)} className={`absolute right-0 ${elegantButtonClass}`}>
          {t("messages.newMessage")}
        </button>
      </div>

      {hasAnyConversations && (
        <div className="relative mb-4">
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3-3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("messages.searchPlaceholder")}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      )}

      {status === "loading" && <PostSkeletonList count={2} />}
      {status === "error" && <p className="text-red-500">{t("messages.loadError")}</p>}
      {status === "ready" && hasAnyConversations === false && (
        <p className="text-gray-500 dark:text-gray-400">{t("messages.empty")}</p>
      )}
      {status === "ready" && hasAnyConversations && query.trim() && rows.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">{t("messages.noSearchResults")}</p>
      )}

      {status === "ready" && (
        <div className="space-y-2">
          {rows.map((row) => (
            <Link
              key={row.userId}
              to={`/messages/${row.userId}`}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
            >
              <Avatar name={row.name} picture={row.picture} presetId={row.avatarPreset} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{row.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(row.lastMessageAt, language, t, tp)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{row.lastMessage}</p>
              </div>
              {row.unreadCount > 0 && (
                <span className="h-5 min-w-[1.25rem] px-1.5 rounded-full bg-violet-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  {row.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {showNewMessage && (
        <NewMessageModal currentUserId={currentUser.id} onClose={() => setShowNewMessage(false)} />
      )}
      {showFindPeople && <PeopleSuggestionsModal onClose={() => setShowFindPeople(false)} />}
    </div>
  );
}
