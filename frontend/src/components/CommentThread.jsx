import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import LikeButton from "./LikeButton.jsx";
import CommentComposer from "./CommentComposer.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { formatRelativeTime } from "../formatDate.js";

function CommentNode({ comment, currentUser, onReply, onLike, requireUser }) {
  const { t, tp, language } = useI18n();
  const [replying, setReplying] = useState(false);

  function handleReplyClick() {
    if (!requireUser()) return;
    setReplying((v) => !v);
  }

  function handleLikeClick() {
    if (!requireUser()) return;
    onLike(comment.id);
  }

  return (
    <div className="flex gap-2.5">
      <Avatar name={comment.authorName} picture={comment.authorPicture} presetId={comment.authorAvatarPreset} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/u/${comment.authorHandle}`}
              className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 truncate"
            >
              {comment.authorName}
            </Link>
            <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
              {formatRelativeTime(comment.createdAt, language, t, tp)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            {comment.text}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-4 pl-3">
          <LikeButton liked={comment.likedByMe} count={comment.likeCount} onToggle={handleLikeClick} size="sm" />
          <button
            type="button"
            onClick={handleReplyClick}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
          >
            {t("comment.reply")}
          </button>
        </div>

        {replying && (
          <div className="mt-2 pl-3">
            <CommentComposer
              autoFocus
              placeholder={t("comment.replyPlaceholder", { name: comment.authorName })}
              onCancel={() => setReplying(false)}
              onSubmit={(text) => onReply(comment.id, text)}
            />
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-3">
            {comment.replies.map((reply) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onReply={onReply}
                onLike={onLike}
                requireUser={requireUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentThread({ comments, currentUser, onReply, onLike, requireUser }) {
  const { t } = useI18n();

  if (!comments.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t("comment.empty")}</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          onReply={onReply}
          onLike={onLike}
          requireUser={requireUser}
        />
      ))}
    </div>
  );
}
