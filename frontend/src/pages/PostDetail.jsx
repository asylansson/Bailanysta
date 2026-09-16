import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchPost,
  fetchComments,
  createComment,
  toggleLikeComment,
  toggleLikePost,
  updatePost,
} from "../api.js";
import PostCard from "../components/PostCard.jsx";
import CommentComposer from "../components/CommentComposer.jsx";
import CommentThread from "../components/CommentThread.jsx";
import { PostSkeleton } from "../components/Skeleton.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function PostDetail({ currentUser, requireUser }) {
  const { id } = useParams();
  const { t } = useI18n();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("loading");

  async function loadComments() {
    const tree = await fetchComments(id);
    setComments(tree);
  }

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all([fetchPost(id), fetchComments(id)])
      .then(([postData, commentsData]) => {
        if (!cancelled) {
          setPost(postData);
          setComments(commentsData);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [id, currentUser]);

  async function handleLikeToggle(postId) {
    const updated = await toggleLikePost(postId);
    setPost(updated);
  }

  async function handleEdited(postId, text) {
    const updated = await updatePost(postId, { text });
    setPost(updated);
  }

  async function handleTopLevelComment(text) {
    if (!requireUser()) return;
    await createComment(id, { text });
    await loadComments();
    setPost((p) => p && { ...p, commentCount: p.commentCount + 1, commentedByMe: true });
  }

  async function handleReply(parentId, text) {
    await createComment(id, { text, parentId });
    await loadComments();
    setPost((p) => p && { ...p, commentCount: p.commentCount + 1, commentedByMe: true });
  }

  async function handleCommentLike(commentId) {
    await toggleLikeComment(commentId);
    await loadComments();
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PostSkeleton />
      </div>
    );
  }

  if (status === "error" || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-red-500">{t("postDetail.notFound")}</p>
        <Link to="/" className="text-violet-600 dark:text-violet-400 hover:underline">
          {t("postDetail.backToFeed")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400">
        {t("postDetail.backToFeed")}
      </Link>

      <div className="mt-3">
        <PostCard
          post={post}
          currentUser={currentUser}
          requireUser={requireUser}
          onLikeToggle={handleLikeToggle}
          onEdited={handleEdited}
          linkToDetail={false}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {t("postDetail.comments", { count: post.commentCount })}
        </h2>

        <div className="mb-4">
          <CommentComposer onSubmit={handleTopLevelComment} />
        </div>

        <CommentThread
          comments={comments}
          currentUser={currentUser}
          onReply={handleReply}
          onLike={handleCommentLike}
          requireUser={requireUser}
        />
      </div>
    </div>
  );
}
