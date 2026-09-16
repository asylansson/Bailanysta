// In dev, Vite proxies "/api" to the local backend (see vite.config.js). In
// production the frontend and backend are deployed separately, so the full
// backend URL must be supplied via VITE_API_BASE_URL at build time.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

function withParams(path, params) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return qs ? `${path}?${qs}` : path;
}

export function signInWithGoogle(credential) {
  return request("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
}

export function fetchFeed({ q, tab } = {}) {
  return request(withParams("/posts", { q, tab }));
}

export function fetchPostsByAuthor(userId) {
  return request(`/posts/author/${userId}`);
}

export function fetchPost(id) {
  return request(`/posts/${id}`);
}

export function createPost({ text, communityId, topic } = {}) {
  return request("/posts", {
    method: "POST",
    body: JSON.stringify({ text, communityId: communityId || undefined, topic: topic || undefined }),
  });
}

export function fetchCommunityPosts(communityId) {
  return request(withParams("/posts", { communityId }));
}

export function updatePost(id, { text }) {
  return request(`/posts/${id}`, { method: "PATCH", body: JSON.stringify({ text }) });
}

export function toggleLikePost(id) {
  return request(`/posts/${id}/like`, { method: "POST" });
}

export function fetchComments(postId) {
  return request(`/posts/${postId}/comments`);
}

export function createComment(postId, { text, parentId }) {
  return request(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text, parentId: parentId || null }),
  });
}

export function toggleLikeComment(id) {
  return request(`/comments/${id}/like`, { method: "POST" });
}

export function fetchUserProfile(userId) {
  return request(`/users/${userId}`);
}

export function toggleFollow(userId) {
  return request(`/users/${userId}/follow`, { method: "POST" });
}

export function fetchFollowers(userId) {
  return request(`/users/${userId}/followers`);
}

export function fetchFriends(userId) {
  return request(`/users/${userId}/friends`);
}

export function fetchFollowing(userId) {
  return request(`/users/${userId}/following`);
}

export function fetchFollowRequests() {
  return request("/users/me/follow-requests");
}

export function acceptFollowRequest(id) {
  return request(`/users/follow-requests/${id}/accept`, { method: "POST" });
}

export function declineFollowRequest(id) {
  return request(`/users/follow-requests/${id}/decline`, { method: "POST" });
}

export function fetchPeopleSuggestions() {
  return request("/users/suggestions/people");
}

export function fetchNotifications() {
  return request("/notifications");
}

export function markNotificationsRead() {
  return request("/notifications/read", { method: "POST" });
}

export function fetchMySettings() {
  return request("/users/me");
}

export function updateMySettings(patch) {
  return request("/users/me", { method: "PATCH", body: JSON.stringify(patch) });
}

export function fetchConversations({ q } = {}) {
  return request(withParams("/conversations", { q }));
}

export function fetchConversationStatus(userId) {
  return request(`/conversations/${userId}`);
}

export function fetchConversationMessages(userId) {
  return request(`/conversations/${userId}/messages`);
}

export function sendMessageTo(userId, text) {
  return request(`/conversations/${userId}/messages`, { method: "POST", body: JSON.stringify({ text }) });
}

export function markConversationRead(userId) {
  return request(`/conversations/${userId}/read`, { method: "POST" });
}

export function fetchCommunities({ q } = {}) {
  return request(withParams("/communities", { q }));
}

export function fetchUserCommunities(userId) {
  return request(`/communities/member/${userId}`);
}

export function fetchCommunity(id) {
  return request(`/communities/${id}`);
}

export function createCommunity({ name, nickname, description, visibility, topics }) {
  return request("/communities", {
    method: "POST",
    body: JSON.stringify({ name, nickname, description, visibility, topics }),
  });
}

export function updateCommunity(id, patch) {
  return request(`/communities/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteCommunity(id) {
  return request(`/communities/${id}`, { method: "DELETE" });
}

export function joinCommunity(id) {
  return request(`/communities/${id}/join`, { method: "POST" });
}

export function leaveCommunity(id) {
  return request(`/communities/${id}/leave`, { method: "POST" });
}

export function fetchCommunityMembers(id) {
  return request(`/communities/${id}/members`);
}

export function removeCommunityMember(id, userId) {
  return request(`/communities/${id}/members/${userId}`, { method: "DELETE" });
}

export function fetchCommunityJoinRequests(id) {
  return request(`/communities/${id}/join-requests`);
}

export function acceptCommunityJoinRequest(id, userId) {
  return request(`/communities/${id}/join-requests/${userId}/accept`, { method: "POST" });
}

export function declineCommunityJoinRequest(id, userId) {
  return request(`/communities/${id}/join-requests/${userId}/decline`, { method: "POST" });
}

export function fetchCommunitySuggestions() {
  return request("/communities/suggestions");
}

export function search(q) {
  return request(withParams("/search", { q }));
}
