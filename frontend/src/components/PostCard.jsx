import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import LikeButton from "./LikeButton.jsx";
import HashtagText from "./HashtagText.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { formatRelativeTime } from "../formatDate.js";

const MAX_LENGTH = 1000;

export default function PostCard({ post, currentUser, onLikeToggle, onEdited, requireUser, linkToDetail = true }) {
  const { t, tp, language } = useI18n();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOwner = currentUser?.id === post.authorId;

  function handleLikeClick() {
    if (!requireUser()) return;
    onLikeToggle(post.id);
  }

  function startEditing() {
    setDraft(post.text);
    setError("");
    setEditing(true);
  }

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSaving(true);
    setError("");
    try {
      await onEdited(post.id, trimmed);
      setEditing(false);
    } catch (err) {
      setError(err.message || t("post.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-4 flex gap-3">
      <Link to={`/u/${post.authorHandle}`} className="shrink-0">
        <Avatar name={post.authorName} picture={post.authorPicture} presetId={post.authorAvatarPreset} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/u/${post.authorHandle}`}
            className="font-semibold text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 truncate"
          >
            {post.authorName}
          </Link>
          <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
            {formatRelativeTime(post.createdAt, language, t, tp)}
            {post.updatedAt && ` · ${t("post.edited")}`}
          </span>
        </div>

        {editing ? (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!draft.trim() || saving}
                className="px-3 py-1 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? t("common.saving") : t("post.save")}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {t("post.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            <HashtagText text={post.text} />
          </p>
        )}

        {!editing && (
          <div className="mt-3 flex items-center gap-4">
            <LikeButton liked={post.likedByMe} count={post.likeCount} onToggle={handleLikeClick} />
            {linkToDetail ? (
              <Link
                to={`/posts/${post.id}`}
                className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  post.commentedByMe
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill={post.commentedByMe ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                  />
                </svg>
                <span>{post.commentCount}</span>
              </Link>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  post.commentedByMe ? "text-violet-600 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill={post.commentedByMe ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                  />
                </svg>
                <span>{post.commentCount}</span>
              </span>
            )}
            {isOwner && (
              <button
                onClick={startEditing}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
              >
                {t("common.edit")}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
