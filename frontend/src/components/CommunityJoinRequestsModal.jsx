import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCommunityJoinRequests, acceptCommunityJoinRequest, declineCommunityJoinRequest } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import Avatar from "./Avatar.jsx";
import { RowSkeletonList } from "./Skeleton.jsx";

export default function CommunityJoinRequestsModal({ communityId, onClose, onChange }) {
  const { t } = useI18n();
  const [list, setList] = useState(null);
  const [status, setStatus] = useState("loading");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchCommunityJoinRequests(communityId)
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
  }, [communityId]);

  async function handleAccept(userId) {
    setBusyId(userId);
    try {
      await acceptCommunityJoinRequest(communityId, userId);
      setList((prev) => prev.filter((r) => r.user.id !== userId));
      onChange?.();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(userId) {
    setBusyId(userId);
    try {
      await declineCommunityJoinRequest(communityId, userId);
      setList((prev) => prev.filter((r) => r.user.id !== userId));
      onChange?.();
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
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t("communities.joinRequestsTitle")}</h2>
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
          {status === "loading" && <RowSkeletonList count={3} />}
          {status === "ready" && list.length === 0 && (
            <p className="p-3 text-sm text-gray-500 dark:text-gray-400">{t("communities.noJoinRequests")}</p>
          )}
          {status === "ready" &&
            list.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg">
                <Link to={`/u/${r.user.handle}`} onClick={onClose} className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={r.user.name} picture={r.user.picture} presetId={r.user.avatarPreset} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{r.user.name}</p>
                    {r.user.nickname && <p className="text-xs text-gray-400 truncate">{r.user.nickname}</p>}
                  </div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleAccept(r.user.id)}
                    disabled={busyId === r.user.id}
                    className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-40"
                  >
                    {t("profile.accept")}
                  </button>
                  <button
                    onClick={() => handleDecline(r.user.id)}
                    disabled={busyId === r.user.id}
                    className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
                  >
                    {t("profile.decline")}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
