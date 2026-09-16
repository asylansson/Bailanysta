import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNotifications, markNotificationsRead } from "../api.js";
import Avatar from "../components/Avatar.jsx";
import NotificationIcon from "../components/NotificationIcon.jsx";
import { NotificationSkeletonList } from "../components/Skeleton.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { formatRelativeTime } from "../formatDate.js";

export default function NotificationsPage({ currentUser }) {
  const { t, tp, language } = useI18n();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    setStatus("loading");
    fetchNotifications()
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setStatus("ready");
        }
        return markNotificationsRead();
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-gray-500 dark:text-gray-400">{t("notifications.signInPrompt")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative flex items-center justify-center mb-4">
        <BackHomeButton />
        <h1 className="page-title text-xl font-bold tracking-tight text-violet-700 dark:text-violet-300">
          {t("notifications.title")}
        </h1>
      </div>

      {status === "loading" && <NotificationSkeletonList />}
      {status === "error" && <p className="text-red-500">{t("notifications.loadError")}</p>}
      {status === "ready" && items.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">{t("notifications.empty")}</p>
      )}

      {status === "ready" && (
      <div className="space-y-2">
        {items.map((n) => {
          const content = (
            <div
              className={`flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-3 ${
                !n.read ? "border-l-4 border-l-violet-500" : ""
              }`}
            >
              <Avatar name={n.actorName} picture={n.actorPicture} presetId={n.actorAvatarPreset} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">{n.actorName}</span>{" "}
                  {t(`notifications.${n.type}`, { name: n.communityName })}
                </p>
                <p className="text-xs text-gray-400">{formatRelativeTime(n.createdAt, language, t, tp)}</p>
              </div>
              <NotificationIcon type={n.type} />
            </div>
          );

          const linkTo = n.postId
            ? `/posts/${n.postId}`
            : n.type === "follow" || n.type === "follow_request" || n.type === "follow_accepted"
            ? `/u/${n.actorId}`
            : n.communityId
            ? `/communities/${n.communityId}`
            : null;

          return linkTo ? (
            <Link key={n.id} to={linkTo} className="block">
              {content}
            </Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}
      </div>
      )}
    </div>
  );
}
