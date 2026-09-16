import { Router } from "express";
import { randomUUID } from "crypto";
import { readDB, withDB } from "../db.js";
import {
  findUserById,
  findUserByNickname,
  findUserByHandleOrId,
  userHandle,
  addNotification,
  displayName,
  isMutualFollow,
  serializeMe,
  serializeUserSummary,
  canViewCommunity,
  canViewUserContent,
} from "../helpers.js";
import { requireAuth } from "../auth.js";
import { TOPIC_IDS } from "../topics.js";

const router = Router();
const NICKNAME_RE = /^@[a-zA-Z0-9_]{3,20}$/;
const SUPPORTED_LANGUAGES = ["kk", "ru", "en"];
const MAX_INTERESTS = 8;

// GET /api/users/me - my own full profile (for Settings)
router.get("/me", requireAuth, async (req, res) => {
  const db = await readDB();
  const user = findUserById(db, req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(serializeMe(user));
});

// GET /api/users/suggestions/people - people you might want to follow
router.get("/suggestions/people", requireAuth, async (req, res) => {
  const db = await readDB();
  const viewerId = req.user.id;

  const myFollowingIds = db.follows.filter((f) => f.followerId === viewerId).map((f) => f.followingId);
  const excluded = new Set([viewerId, ...myFollowingIds]);
  for (const r of db.followRequests || []) {
    if (r.requesterId === viewerId) excluded.add(r.targetId);
  }

  // Simple "people you may know" score: how many people you already follow also follow this candidate.
  const scores = new Map();
  for (const f of db.follows) {
    if (myFollowingIds.includes(f.followerId) && !excluded.has(f.followingId)) {
      scores.set(f.followingId, (scores.get(f.followingId) || 0) + 1);
    }
  }

  let candidateIds = [...scores.keys()];
  if (candidateIds.length < 20) {
    for (const u of db.users) {
      if (candidateIds.length >= 20) break;
      if (!excluded.has(u.id) && !candidateIds.includes(u.id)) candidateIds.push(u.id);
    }
  }
  candidateIds.sort((a, b) => (scores.get(b) || 0) - (scores.get(a) || 0));

  const list = candidateIds
    .slice(0, 20)
    .map((id) => findUserById(db, id))
    .filter(Boolean)
    .map((u) => serializeUserSummary(db, u, viewerId));
  res.json(list);
});

// GET /api/users/me/follow-requests - incoming pending follow requests
router.get("/me/follow-requests", requireAuth, async (req, res) => {
  const db = await readDB();
  const list = (db.followRequests || [])
    .filter((r) => r.targetId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      requester: (() => {
        const u = findUserById(db, r.requesterId);
        return u ? serializeUserSummary(db, u, req.user.id) : null;
      })(),
    }))
    .filter((r) => r.requester);
  res.json(list);
});

// POST /api/users/follow-requests/:requestId/accept
router.post("/follow-requests/:requestId/accept", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const request = (db.followRequests || []).find(
      (r) => r.id === req.params.requestId && r.targetId === req.user.id
    );
    if (!request) return { status: 404, error: "Follow request not found" };

    db.followRequests = db.followRequests.filter((r) => r.id !== request.id);
    db.follows.push({ followerId: request.requesterId, followingId: req.user.id });
    addNotification(db, { recipientId: request.requesterId, type: "follow_accepted", actorId: req.user.id });

    return { payload: { ok: true } };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// POST /api/users/follow-requests/:requestId/decline
router.post("/follow-requests/:requestId/decline", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const request = (db.followRequests || []).find(
      (r) => r.id === req.params.requestId && r.targetId === req.user.id
    );
    if (!request) return { status: 404, error: "Follow request not found" };

    db.followRequests = db.followRequests.filter((r) => r.id !== request.id);
    return { payload: { ok: true } };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// PATCH /api/users/me - update firstName/lastName/nickname/avatarPreset/language/interests/onboarded/isPrivate
router.patch("/me", requireAuth, async (req, res) => {
  const { firstName, lastName, nickname, avatarPreset, language, interests, onboarded, isPrivate } = req.body ?? {};

  if (nickname !== undefined && nickname !== null && nickname !== "" && !NICKNAME_RE.test(nickname)) {
    return res.status(400).json({
      error: "nickname must start with @ and be 3-20 letters, digits, or underscores",
    });
  }
  if (language !== undefined && !SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ error: "language must be one of kk, ru, en" });
  }
  if (interests !== undefined && !Array.isArray(interests)) {
    return res.status(400).json({ error: "interests must be an array of topic ids" });
  }
  if (firstName !== undefined && !firstName.trim()) {
    return res.status(400).json({ error: "First name is required" });
  }
  if (firstName !== undefined && firstName.trim().length > 30) {
    return res.status(400).json({ error: "First name must be 30 characters or fewer" });
  }
  if (lastName !== undefined && lastName.trim().length > 30) {
    return res.status(400).json({ error: "Last name must be 30 characters or fewer" });
  }

  const result = await withDB((db) => {
    const user = findUserById(db, req.user.id);
    if (!user) return { status: 404, error: "User not found" };

    if (nickname) {
      const existing = findUserByNickname(db, nickname);
      if (existing && existing.id !== user.id) {
        return { status: 409, error: "This nickname is already taken" };
      }
    }

    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (nickname !== undefined) user.nickname = nickname || null;
    if (avatarPreset !== undefined) user.avatarPreset = avatarPreset || null;
    if (language !== undefined) user.language = language;
    if (interests !== undefined) {
      user.interests = [...new Set(interests.filter((id) => TOPIC_IDS.includes(id)))].slice(0, MAX_INTERESTS);
    }
    if (onboarded !== undefined) user.onboarded = Boolean(onboarded);
    if (isPrivate !== undefined) user.isPrivate = Boolean(isPrivate);

    return { payload: serializeMe(user) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// GET /api/users/:id - public profile summary (accepts canonical id, nickname, or publicId)
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const user = findUserByHandleOrId(db, req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const viewerId = req.user?.id;
  const isFollowing = viewerId
    ? db.follows.some((f) => f.followerId === viewerId && f.followingId === user.id)
    : false;
  const followRequestPending = viewerId
    ? (db.followRequests || []).some((r) => r.requesterId === viewerId && r.targetId === user.id)
    : false;
  const canView = canViewUserContent(db, user.id, viewerId);

  const postCount = canView ? db.posts.filter((p) => p.authorId === user.id && !p.communityId).length : 0;
  const followerCount = canView ? db.follows.filter((f) => f.followingId === user.id).length : 0;
  const followingCount = canView ? db.follows.filter((f) => f.followerId === user.id).length : 0;
  const communityCount = canView
    ? db.communities.filter((c) => c.memberIds.includes(user.id) && canViewCommunity(db, c, viewerId)).length
    : 0;

  res.json({
    id: user.id,
    handle: userHandle(user),
    name: displayName(user),
    nickname: user.nickname,
    picture: user.picture,
    avatarPreset: user.avatarPreset,
    isPrivate: user.isPrivate || false,
    isLocked: !canView,
    postCount,
    followerCount,
    followingCount,
    communityCount,
    isFollowing,
    followRequestPending,
    isMutualFriend: viewerId ? isMutualFollow(db, viewerId, user.id) : false,
  });
});

// GET /api/users/:id/followers - list of people following this user
router.get("/:id/followers", async (req, res) => {
  const db = await readDB();
  const user = findUserById(db, req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!canViewUserContent(db, user.id, req.user?.id)) return res.json([]);

  const followerIds = db.follows.filter((f) => f.followingId === user.id).map((f) => f.followerId);
  const list = followerIds
    .map((id) => findUserById(db, id))
    .filter(Boolean)
    .map((u) => serializeUserSummary(db, u, req.user?.id));

  res.json(list);
});

// GET /api/users/:id/following - list of people this user follows
router.get("/:id/following", async (req, res) => {
  const db = await readDB();
  const user = findUserById(db, req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!canViewUserContent(db, user.id, req.user?.id)) return res.json([]);

  const followingIds = db.follows.filter((f) => f.followerId === user.id).map((f) => f.followingId);
  const list = followingIds
    .map((id) => findUserById(db, id))
    .filter(Boolean)
    .map((u) => serializeUserSummary(db, u, req.user?.id));

  res.json(list);
});

// GET /api/users/:id/friends - mutual follows (people who follow this user AND are followed back)
router.get("/:id/friends", async (req, res) => {
  const db = await readDB();
  const user = findUserById(db, req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!canViewUserContent(db, user.id, req.user?.id)) return res.json([]);

  const followingIds = new Set(db.follows.filter((f) => f.followerId === user.id).map((f) => f.followingId));
  const followerIds = new Set(db.follows.filter((f) => f.followingId === user.id).map((f) => f.followerId));
  const friendIds = [...followingIds].filter((id) => followerIds.has(id));

  const list = friendIds
    .map((id) => findUserById(db, id))
    .filter(Boolean)
    .map((u) => serializeUserSummary(db, u, req.user?.id));

  res.json(list);
});

// POST /api/users/:id/follow - toggle follow, or request/cancel-request for a private account
router.post("/:id/follow", requireAuth, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  const result = await withDB((db) => {
    const target = findUserById(db, req.params.id);
    if (!target) return { status: 404, error: "User not found" };

    const existingIndex = db.follows.findIndex(
      (f) => f.followerId === req.user.id && f.followingId === target.id
    );

    if (existingIndex !== -1) {
      db.follows.splice(existingIndex, 1);
      const followerCount = db.follows.filter((f) => f.followingId === target.id).length;
      return { payload: { isFollowing: false, followRequestPending: false, followerCount } };
    }

    if (target.isPrivate) {
      db.followRequests = db.followRequests || [];
      const existingRequestIndex = db.followRequests.findIndex(
        (r) => r.requesterId === req.user.id && r.targetId === target.id
      );
      if (existingRequestIndex !== -1) {
        db.followRequests.splice(existingRequestIndex, 1);
        return { payload: { isFollowing: false, followRequestPending: false, followerCount: db.follows.filter((f) => f.followingId === target.id).length } };
      }
      db.followRequests.push({
        id: randomUUID(),
        requesterId: req.user.id,
        targetId: target.id,
        createdAt: new Date().toISOString(),
      });
      addNotification(db, { recipientId: target.id, type: "follow_request", actorId: req.user.id });
      return {
        payload: {
          isFollowing: false,
          followRequestPending: true,
          followerCount: db.follows.filter((f) => f.followingId === target.id).length,
        },
      };
    }

    db.follows.push({ followerId: req.user.id, followingId: target.id });
    addNotification(db, { recipientId: target.id, type: "follow", actorId: req.user.id });
    const followerCount = db.follows.filter((f) => f.followingId === target.id).length;
    return { payload: { isFollowing: true, followRequestPending: false, followerCount } };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

export default router;
