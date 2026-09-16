import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUserProfile, fetchPostsByAuthor, fetchFollowRequests, toggleFollow, toggleLikePost, updatePost } from "../api.js";
import Avatar from "../components/Avatar.jsx";
import PostCard from "../components/PostCard.jsx";
import FollowButton from "../components/FollowButton.jsx";
import FollowListModal from "../components/FollowListModal.jsx";
import CommunityListModal from "../components/CommunityListModal.jsx";
import FollowRequestsModal from "../components/FollowRequestsModal.jsx";
import { PostSkeletonList } from "../components/Skeleton.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

const toolbarIconClass =
  "flex items-center justify-center h-10 w-10 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";

export default function UserProfile({ currentUser, requireUser, onLogout, theme, onToggleTheme }) {
  const { id } = useParams();
  const { t, tp } = useI18n();
  const isOwnProfile = currentUser?.id === id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [followBusy, setFollowBusy] = useState(false);
  const [listModal, setListModal] = useState(null); // null | "followers" | "following" | "communities" | "requests"
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all([fetchUserProfile(id), fetchPostsByAuthor(id)])
      .then(([profileData, postsData]) => {
        if (!cancelled) {
          setProfile(profileData);
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
    if (!isOwnProfile) return;
    let cancelled = false;
    fetchFollowRequests()
      .then((data) => !cancelled && setRequestCount(data.length))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, id]);

  async function handleLikeToggle(postId) {
    const updated = await toggleLikePost(postId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  }

  async function handleEdited(postId, text) {
    const updated = await updatePost(postId, { text });
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  }

  async function handleFollowToggle() {
    if (!requireUser()) return;
    setFollowBusy(true);
    try {
      await toggleFollow(id);
      const [profileData, postsData] = await Promise.all([fetchUserProfile(id), fetchPostsByAuthor(id)]);
      setProfile(profileData);
      setPosts(postsData);
    } finally {
      setFollowBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PostSkeletonList count={1} />
      </div>
    );
  }

  if (status === "error" || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-red-500">{t("profile.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar name={profile.name} picture={profile.picture} presetId={profile.avatarPreset} size="lg" />
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h1>
              {profile.nickname && <span className="text-sm text-gray-400">{profile.nickname}</span>}
              {profile.isPrivate && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  {t("profile.private")}
                </span>
              )}
            </div>
            {profile.isLocked ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.followerCount} {tp("profile.followers", profile.followerCount)}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.postCount} {tp("profile.posts", profile.postCount)}
                {" · "}
                <button onClick={() => setListModal("followers")} className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">
                  {profile.followerCount} {tp("profile.followers", profile.followerCount)}
                </button>
                {" · "}
                <button onClick={() => setListModal("following")} className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">
                  {profile.followingCount} {t("profile.following")}
                </button>
                {" · "}
                <button onClick={() => setListModal("communities")} className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">
                  {profile.communityCount} {tp("profile.communities", profile.communityCount)}
                </button>
              </p>
            )}
            {isOwnProfile && requestCount > 0 && (
              <button
                onClick={() => setListModal("requests")}
                className="mt-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
              >
                {t("profile.followRequestsButton", { count: requestCount })}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isOwnProfile && profile.isMutualFriend && (
            <Link
              to={`/messages/${id}`}
              className="px-4 py-1.5 rounded-lg text-sm font-medium border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors"
            >
              {t("profile.message")}
            </Link>
          )}
          {isOwnProfile ? (
            <div className="flex items-center gap-1">
              <Link to="/settings" title={t("nav.settings")} className={toolbarIconClass}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={onToggleTheme}
                title={theme === "dark" ? t("nav.lightTheme") : t("nav.darkTheme")}
                className={toolbarIconClass}
              >
                {theme === "dark" ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <path strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                  </svg>
                )}
              </button>

              <button type="button" onClick={onLogout} title={t("profile.signOut")} className={toolbarIconClass}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5" />
                  <path strokeLinecap="round" d="M21 12H9" />
                </svg>
              </button>
            </div>
          ) : (
            <FollowButton
              isFollowing={profile.isFollowing}
              followRequestPending={profile.followRequestPending}
              isPrivate={profile.isPrivate}
              onToggle={handleFollowToggle}
              disabled={followBusy}
            />
          )}
        </div>
      </div>

      {profile.isLocked ? (
        <p className="text-gray-500 dark:text-gray-400">{t("profile.lockedMessage")}</p>
      ) : (
        <>
          {posts.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              {isOwnProfile ? t("profile.noPostsOwn") : t("profile.noPostsOther")}
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
        </>
      )}

      {(listModal === "followers" || listModal === "following") && (
        <FollowListModal userId={id} mode={listModal} onClose={() => setListModal(null)} />
      )}
      {listModal === "communities" && <CommunityListModal userId={id} onClose={() => setListModal(null)} />}
      {listModal === "requests" && (
        <FollowRequestsModal
          onClose={() => setListModal(null)}
          onChange={() => setRequestCount((c) => Math.max(0, c - 1))}
        />
      )}
    </div>
  );
}
