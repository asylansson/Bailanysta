import { randomUUID } from "crypto";

export function findUserById(db, id) {
  if (!id) return null;
  return db.users.find((u) => u.id === id) || null;
}

export function findUserByNickname(db, nickname) {
  if (!nickname) return null;
  const normalized = nickname.trim().toLowerCase();
  return db.users.find((u) => u.nickname && u.nickname.toLowerCase() === normalized) || null;
}

function nextPublicUserId(db) {
  return db.users.reduce((max, u) => Math.max(max, u.publicId || 0), 0) + 1;
}

// The short id shown in a user's profile URL: their nickname (without the
// leading @) when they've set one, otherwise a small sequential number -
// either way, never the raw UUID `id`, which is what a real Google-linked
// account gets internally.
export function userHandle(user) {
  if (!user) return null;
  if (user.nickname) return user.nickname.replace(/^@/, "");
  return String(user.publicId ?? user.id);
}

export function communityHandle(community) {
  if (!community) return null;
  return (community.nickname || "").replace(/^@/, "");
}

// Resolves a URL segment that may be a canonical id, a nickname (with or
// without @), or a numeric publicId - used only by the "detail" endpoints
// that a profile/community link actually navigates to.
export function findUserByHandleOrId(db, param) {
  if (!param) return null;
  const byId = findUserById(db, param);
  if (byId) return byId;
  const normalized = param.trim().toLowerCase();
  const byNickname = db.users.find((u) => u.nickname && u.nickname.replace(/^@/, "").toLowerCase() === normalized);
  if (byNickname) return byNickname;
  if (/^\d+$/.test(param)) {
    const num = Number(param);
    return db.users.find((u) => u.publicId === num) || null;
  }
  return null;
}

export function findCommunityByHandleOrId(db, param) {
  if (!param) return null;
  const byId = db.communities.find((c) => c.id === param);
  if (byId) return byId;
  const normalized = param.trim().toLowerCase();
  return db.communities.find((c) => c.nickname && c.nickname.replace(/^@/, "").toLowerCase() === normalized) || null;
}

export function getOrCreateGoogleUser(db, { googleId, email, name, givenName, familyName, picture }) {
  let user = db.users.find((u) => u.email === email);
  if (user) {
    user.name = name;
    user.picture = picture;
    return user;
  }
  user = {
    id: randomUUID(),
    googleId,
    email,
    name,
    firstName: givenName || name.split(" ")[0] || name,
    lastName: familyName || name.split(" ").slice(1).join(" ") || "",
    nickname: null,
    picture,
    avatarPreset: null,
    language: "en",
    interests: [],
    onboarded: false,
    isPrivate: false,
    publicId: nextPublicUserId(db),
  };
  db.users.push(user);
  return user;
}

export function displayName(user) {
  if (!user) return null;
  const combined = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return combined || user.name;
}

export function isMutualFollow(db, aId, bId) {
  if (!aId || !bId || aId === bId) return false;
  const aFollowsB = db.follows.some((f) => f.followerId === aId && f.followingId === bId);
  const bFollowsA = db.follows.some((f) => f.followerId === bId && f.followingId === aId);
  return aFollowsB && bFollowsA;
}

// Whether viewerId can see ownerId's posts / followers / following / communities lists.
// Everyone can see a public account's content; a private account's content is visible
// only to the owner and to people the owner has approved as followers.
export function canViewUserContent(db, ownerId, viewerId) {
  const owner = findUserById(db, ownerId);
  if (!owner || !owner.isPrivate) return true;
  if (!viewerId) return false;
  if (viewerId === ownerId) return true;
  return db.follows.some((f) => f.followerId === viewerId && f.followingId === ownerId);
}

function authorFields(db, authorId) {
  const author = findUserById(db, authorId);
  return {
    authorId,
    authorName: author ? displayName(author) : "Удалённый пользователь",
    authorPicture: author ? author.picture : null,
    authorAvatarPreset: author ? author.avatarPreset : null,
    authorHandle: author ? userHandle(author) : null,
  };
}

export function serializePost(db, post, viewerId) {
  const postComments = db.comments.filter((c) => c.postId === post.id);
  return {
    id: post.id,
    ...authorFields(db, post.authorId),
    communityId: post.communityId || null,
    topic: post.topic || null,
    text: post.text,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt || null,
    likeCount: post.likedBy.length,
    likedByMe: viewerId ? post.likedBy.includes(viewerId) : false,
    commentCount: postComments.length,
    commentedByMe: viewerId ? postComments.some((c) => c.authorId === viewerId) : false,
  };
}

export function serializeComment(db, comment, viewerId) {
  return {
    id: comment.id,
    postId: comment.postId,
    parentId: comment.parentId,
    ...authorFields(db, comment.authorId),
    text: comment.text,
    createdAt: comment.createdAt,
    likeCount: comment.likedBy.length,
    likedByMe: viewerId ? comment.likedBy.includes(viewerId) : false,
  };
}

export function buildCommentTree(serializedComments) {
  const byId = new Map(serializedComments.map((c) => [c.id, { ...c, replies: [] }]));
  const roots = [];

  for (const comment of byId.values()) {
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId).replies.push(comment);
    } else {
      roots.push(comment);
    }
  }

  const byOldestFirst = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
  const sortRecursively = (list) => {
    list.sort(byOldestFirst);
    list.forEach((c) => sortRecursively(c.replies));
  };
  sortRecursively(roots);

  return roots;
}

export function addNotification(db, { recipientId, type, actorId, postId, commentId, communityId }) {
  if (!recipientId || recipientId === actorId) return;
  db.notifications.push({
    id: randomUUID(),
    recipientId,
    type,
    actorId,
    postId: postId || null,
    commentId: commentId || null,
    communityId: communityId || null,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

export function serializeNotification(db, notification) {
  const actor = findUserById(db, notification.actorId);
  const community = notification.communityId
    ? db.communities.find((c) => c.id === notification.communityId)
    : null;
  return {
    id: notification.id,
    type: notification.type,
    actorId: notification.actorId,
    actorName: actor ? displayName(actor) : "Удалённый пользователь",
    actorPicture: actor ? actor.picture : null,
    actorAvatarPreset: actor ? actor.avatarPreset : null,
    actorHandle: actor ? userHandle(actor) : null,
    postId: notification.postId,
    commentId: notification.commentId,
    communityId: notification.communityId,
    communityName: community ? community.name : null,
    communityHandle: community ? communityHandle(community) : null,
    createdAt: notification.createdAt,
    read: notification.read,
  };
}

export function serializeMe(user) {
  return {
    id: user.id,
    handle: userHandle(user),
    name: displayName(user),
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    nickname: user.nickname,
    email: user.email,
    picture: user.picture,
    avatarPreset: user.avatarPreset,
    language: user.language || "en",
    interests: user.interests || [],
    onboarded: user.onboarded !== false,
    isPrivate: user.isPrivate || false,
  };
}

export function serializeUserSummary(db, user, viewerId) {
  const isFollowing = viewerId
    ? db.follows.some((f) => f.followerId === viewerId && f.followingId === user.id)
    : false;
  const followRequestPending = viewerId
    ? (db.followRequests || []).some((r) => r.requesterId === viewerId && r.targetId === user.id)
    : false;
  return {
    id: user.id,
    handle: userHandle(user),
    name: displayName(user),
    nickname: user.nickname,
    picture: user.picture,
    avatarPreset: user.avatarPreset,
    isPrivate: user.isPrivate || false,
    isFollowing,
    followRequestPending,
    isMutualFriend: viewerId ? isMutualFollow(db, viewerId, user.id) : false,
  };
}

// Cheap heuristic for ranking posts by language on the home feed - looks for
// Kazakh-specific Cyrillic letters first (absent from standard Russian), then
// falls back to generic Cyrillic vs Latin. Not linguistically perfect, but
// good enough to bucket a post as kk/ru/en for sorting purposes.
const KAZAKH_LETTERS = /[әғқңөұүһі]/i;
const CYRILLIC_LETTERS = /[а-яё]/i;

export function detectPostLanguage(text) {
  if (!text) return "ru";
  if (KAZAKH_LETTERS.test(text)) return "kk";
  if (CYRILLIC_LETTERS.test(text)) return "ru";
  return "en";
}

export function findCommunityByNickname(db, nickname) {
  if (!nickname) return null;
  const normalized = nickname.trim().toLowerCase();
  return db.communities.find((c) => c.nickname && c.nickname.toLowerCase() === normalized) || null;
}

// Every community (public or private) is discoverable: its name, description, topics,
// and member count can be listed/searched by anyone, and anyone can request to join a
// private one. Only a private community's posts are gated - see canViewCommunityPosts.
export function canViewCommunity() {
  return true;
}

export function canViewCommunityPosts(db, community, viewerId) {
  if (community.visibility === "public") return true;
  if (!viewerId) return false;
  return community.memberIds.includes(viewerId);
}

export function serializeCommunity(db, community, viewerId) {
  const joinRequestPending = viewerId
    ? (db.communityJoinRequests || []).some((r) => r.communityId === community.id && r.userId === viewerId)
    : false;
  return {
    id: community.id,
    handle: communityHandle(community),
    name: community.name,
    nickname: community.nickname || null,
    description: community.description,
    visibility: community.visibility,
    topics: community.topics || [],
    memberCount: community.memberIds.length,
    isMember: viewerId ? community.memberIds.includes(viewerId) : false,
    isCreator: viewerId ? community.creatorId === viewerId : false,
    isAdmin: viewerId ? community.creatorId === viewerId : false,
    joinRequestPending,
    createdAt: community.createdAt,
  };
}
