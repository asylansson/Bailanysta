import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFeed, toggleLikePost, updatePost, createPost } from "../api.js";
import PostCard from "../components/PostCard.jsx";
import NewPostModal from "../components/NewPostModal.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { PostSkeletonList } from "../components/Skeleton.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

const iconLinkClass =
  "flex items-center justify-center h-10 w-10 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";

function tabButtonClass(active) {
  return `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
    active
      ? "bg-violet-600 text-white"
      : "border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950"
  }`;
}

export default function Feed({ currentUser, requireUser }) {
  const { t } = useI18n();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [showComposer, setShowComposer] = useState(false);
  const [tab, setTab] = useState("recommendations");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchFeed({ tab })
      .then((data) => {
        if (!cancelled) {
          setPosts(data);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [currentUser, tab]);

  function handleTabClick(nextTab) {
    if (nextTab === "following" && !requireUser()) return;
    setTab(nextTab);
  }

  async function handleCreate({ text }) {
    const post = await createPost({ text });
    setPosts((prev) => [post, ...prev]);
  }

  function handleComposeClick() {
    if (!requireUser()) return;
    setShowComposer(true);
  }

  async function handleLikeToggle(postId) {
    const updated = await toggleLikePost(postId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  }

  async function handleEdited(postId, text) {
    const updated = await updatePost(postId, { text });
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative flex items-center justify-center mb-4">
        <h1 className="page-title text-xl font-bold tracking-tight text-violet-700 dark:text-violet-300">
          {t("feed.title")}
        </h1>
        {currentUser && (
          <div className="absolute right-0 flex items-center gap-1">
            <button type="button" onClick={handleComposeClick} title={t("feed.newPostTitle")} className={iconLinkClass}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <Link to="/search" title={t("nav.search")} className={iconLinkClass}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3-3" />
              </svg>
            </Link>
            <NotificationBell currentUser={currentUser} />
          </div>
        )}
      </div>

      {currentUser && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleTabClick("recommendations")}
            className={tabButtonClass(tab === "recommendations")}
          >
            {t("feed.recommendations")}
          </button>
          <button type="button" onClick={() => handleTabClick("following")} className={tabButtonClass(tab === "following")}>
            {t("feed.subscriptions")}
          </button>
        </div>
      )}

      {status === "loading" && <PostSkeletonList />}
      {status === "error" && <p className="text-red-500">{t("feed.loadError")}</p>}
      {status === "ready" && posts.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          {tab === "following" ? t("feed.emptySubscriptions") : t("feed.emptyRecommendations")}
        </p>
      )}

      {status === "ready" && (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              requireUser={requireUser}
              onLikeToggle={handleLikeToggle}
              onEdited={handleEdited}
            />
          ))}
        </div>
      )}

      {showComposer && currentUser && (
        <NewPostModal user={currentUser} onSubmit={handleCreate} onClose={() => setShowComposer(false)} />
      )}
    </div>
  );
}
