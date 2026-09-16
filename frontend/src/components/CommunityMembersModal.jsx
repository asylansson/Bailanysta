import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCommunityMembers, removeCommunityMember } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import Avatar from "./Avatar.jsx";
import { RowSkeletonList } from "./Skeleton.jsx";

export default function CommunityMembersModal({ communityId, isAdmin, onClose }) {
  const { t } = useI18n();
  const [list, setList] = useState(null);
  const [status, setStatus] = useState("loading");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchCommunityMembers(communityId)
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

  async function handleRemove(userId) {
    setBusyId(userId);
    try {
      await removeCommunityMember(communityId, userId);
      setList((prev) => prev.filter((u) => u.id !== userId));
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
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t("communities.membersTitle")}</h2>
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
          {status === "ready" &&
            list.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg">
                <Link to={`/u/${u.handle}`} onClick={onClose} className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={u.name} picture={u.picture} presetId={u.avatarPreset} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                    {u.nickname && <p className="text-xs text-gray-400 truncate">{u.nickname}</p>}
                  </div>
                </Link>
                {u.isAdmin && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                    {t("communities.admin")}
                  </span>
                )}
                {isAdmin && !u.isAdmin && (
                  <button
                    onClick={() => handleRemove(u.id)}
                    disabled={busyId === u.id}
                    className="shrink-0 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
                  >
                    {t("communities.removeMember")}
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
