import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPeopleSuggestions, toggleFollow } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import Avatar from "./Avatar.jsx";
import FollowButton from "./FollowButton.jsx";
import { RowSkeletonList } from "./Skeleton.jsx";

export default function PeopleSuggestionsModal({ onClose }) {
  const { t } = useI18n();
  const [list, setList] = useState(null);
  const [status, setStatus] = useState("loading");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchPeopleSuggestions()
      .then((data) => {
        if (!cancelled) {
          setList(data);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle(userId) {
    setBusyId(userId);
    try {
      const result = await toggleFollow(userId);
      setList((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isFollowing: result.isFollowing, followRequestPending: result.followRequestPending }
            : u
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/40 modal-overlay-enter" onClick={onClose}>
      <div
        className="w-full max-w-sm max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-violet-400 dark:border-violet-900 modal-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-400 dark:border-violet-900">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t("messages.findPeopleTitle")}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
            title={t("common.close")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {status === "loading" && <RowSkeletonList count={4} />}
          {status === "ready" && list.length === 0 && (
            <p className="p-3 text-sm text-gray-500 dark:text-gray-400">{t("messages.noPeopleSuggestions")}</p>
          )}
          {status === "ready" &&
            list.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg">
                <Link to={`/u/${u.id}`} onClick={onClose} className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={u.name} picture={u.picture} presetId={u.avatarPreset} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                    {u.nickname && <p className="text-xs text-gray-400 truncate">{u.nickname}</p>}
                  </div>
                </Link>
                <div className="shrink-0">
                  <FollowButton
                    isFollowing={u.isFollowing}
                    followRequestPending={u.followRequestPending}
                    isPrivate={u.isPrivate}
                    onToggle={() => handleToggle(u.id)}
                    disabled={busyId === u.id}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
