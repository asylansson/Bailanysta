import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNotifications } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";

const POLL_INTERVAL_MS = 15000;

export default function NotificationBell({ currentUser }) {
  const { t } = useI18n();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const items = await fetchNotifications();
        if (!cancelled) setUnreadCount(items.filter((n) => !n.read).length);
      } catch {
        // transient network error - keep the previous badge count
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentUser]);

  return (
    <Link
      to="/notifications"
      className="relative flex items-center justify-center h-10 w-10 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={t("notifications.title")}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.65V5a2 2 0 1 0-4 0v.35A6 6 0 0 0 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] px-1 rounded-full bg-violet-600 text-white text-[10px] leading-4 text-center font-semibold">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
