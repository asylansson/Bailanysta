import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchCommunity,
  fetchCommunityPosts,
  fetchCommunityJoinRequests,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
  createPost,
  toggleLikePost,
  updatePost,
} from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import PostCard from "../components/PostCard.jsx";
import PostComposer from "../components/PostComposer.jsx";
import CommunityMembersModal from "../components/CommunityMembersModal.jsx";
import CommunityJoinRequestsModal from "../components/CommunityJoinRequestsModal.jsx";
import EditCommunityModal from "../components/EditCommunityModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { PostSkeletonList } from "../components/Skeleton.jsx";

const elegantButtonClass =
  "px-3 py-1 rounded-full border border-violet-300 dark:border-violet-700 text-xs font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors";

export default function CommunityDetail({ currentUser, requireUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, tp } = useI18n();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // null | "members" | "requests" | "edit" | "delete"
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all([fetchCommunity(id), fetchCommunityPosts(id)])
      .then(([communityData, postsData]) => {
        if (!cancelled) {
          setCommunity(communityData);
          setPosts(postsData);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [id, currentUser]);

  useEffect(() => {
    if (!community?.isAdmin || community.visibility !== "private") return;
    let cancelled = false;
    fetchCommunityJoinRequests(id)
      .then((data) => !cancelled && setRequestCount(data.length))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, community?.isAdmin, community?.visibility]);

  async function handleJoinClick() {
    if (!requireUser()) return;
    setBusy(true);
    try {
      const updated = await joinCommunity(id);
      setCommunity(updated);
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    setBusy(true);
    try {
      const updated = await leaveCommunity(id);
      setCommunity(updated);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteCommunity(id);
      navigate("/communities", { replace: true });
    } finally {
      setBusy(false);
      setModal(null);
    }
  }

  async function handleCreate({ text }) {
    const post = await createPost({ text, communityId: id });
    setPosts((prev) => [post, ...prev]);
  }

  async function handleLikeToggle(postId) {
    const updated = await toggleLikePost(postId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  }

  async function handleEdited(postId, text) {
    const updated = await updatePost(postId, { text });
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PostSkeletonList count={1} />
      </div>
    );
  }

  if (status === "error" || !community) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-red-500">{t("communities.notFound")}</p>
        <Link to="/communities" className="text-violet-600 dark:text-violet-400 hover:underline">
          {t("communities.backToList")}
        </Link>
      </div>
    );
  }

  const joinLabel = community.joinRequestPending
    ? t("communities.requested")
    : community.visibility === "private"
    ? t("communities.requestToJoin")
    : t("communities.join");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link to="/communities" className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400">
        {t("communities.backToList")}
      </Link>

      <div className="mt-3 mb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{community.name}</h1>
            {community.nickname && <span className="text-sm text-gray-400">{community.nickname}</span>}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {community.visibility === "private" ? t("communities.private") : t("communities.public")}
            </span>
          </div>
          {community.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{community.description}</p>}
          {community.topics?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {community.topics.map((topicId) => (
                <span
                  key={topicId}
                  className="text-xs px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300"
                >
                  {t(`topics.${topicId}`)}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => setModal("members")}
            className="mt-2 text-xs text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
          >
            {community.memberCount} {tp("communities.members", community.memberCount)}
          </button>
        </div>

        {!community.isAdmin && (
          <button
            onClick={community.isMember ? handleLeave : handleJoinClick}
            disabled={busy || community.joinRequestPending}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-100 disabled:cursor-default ${
              community.joinRequestPending
                ? "border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"
                : community.isMember
                ? "border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            {community.isMember ? t("communities.leave") : joinLabel}
          </button>
        )}
      </div>

      {community.isAdmin && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {community.visibility === "private" && (
            <button onClick={() => setModal("requests")} className={elegantButtonClass}>
              {t("communities.joinRequestsButton", { count: requestCount })}
            </button>
          )}
          <button onClick={() => setModal("edit")} className={elegantButtonClass}>
            {t("communities.editCommunity")}
          </button>
          <button
            onClick={() => setModal("delete")}
            disabled={busy}
            className="px-3 py-1 rounded-full border border-red-300 dark:border-red-800 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-40"
          >
            {t("communities.deleteCommunity")}
          </button>
        </div>
      )}

      {community.isMember && (
        <div className="mb-6">
          <PostComposer user={currentUser} onSubmit={handleCreate} />
        </div>
      )}

      {posts.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          {community.visibility === "private" && !community.isMember
            ? t("communities.postsLocked")
            : t("communities.noPosts")}
        </p>
      )}

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

      {modal === "members" && (
        <CommunityMembersModal communityId={id} isAdmin={community.isAdmin} onClose={() => setModal(null)} />
      )}
      {modal === "requests" && (
        <CommunityJoinRequestsModal
          communityId={id}
          onClose={() => setModal(null)}
          onChange={() => setRequestCount((c) => Math.max(0, c - 1))}
        />
      )}
      {modal === "edit" && (
        <EditCommunityModal community={community} onUpdated={setCommunity} onClose={() => setModal(null)} />
      )}
      {modal === "delete" && (
        <ConfirmModal
          title={t("communities.deleteCommunity")}
          message={t("communities.deleteConfirm", { name: community.name })}
          confirmLabel={t("communities.deleteCommunity")}
          danger
          busy={busy}
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
