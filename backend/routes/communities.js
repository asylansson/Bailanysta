import { Router } from "express";
import { randomUUID } from "crypto";
import { readDB, withDB } from "../db.js";
import {
  canViewCommunity,
  serializeCommunity,
  serializeUserSummary,
  findUserById,
  findCommunityByNickname,
  addNotification,
} from "../helpers.js";
import { requireAuth } from "../auth.js";
import { TOPIC_IDS } from "../topics.js";

const router = Router();
const MAX_NAME_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_TOPICS = 5;
const NICKNAME_RE = /^@[a-zA-Z0-9_]{3,30}$/;

function visibleTo(db, community, viewerId) {
  return canViewCommunity(db, community, viewerId);
}

function cleanTopics(topics) {
  if (!Array.isArray(topics)) return [];
  return [...new Set(topics.filter((id) => TOPIC_IDS.includes(id)))].slice(0, MAX_TOPICS);
}

// GET /api/communities?q= - browse/search communities visible to the viewer
router.get("/", async (req, res) => {
  const db = await readDB();
  const { q } = req.query;

  let list = db.communities.filter((c) => visibleTo(db, c, req.user?.id));
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    list = list.filter(
      (c) => c.name.toLowerCase().includes(needle) || (c.nickname || "").toLowerCase().includes(needle)
    );
  }

  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list.map((c) => serializeCommunity(db, c, req.user?.id)));
});

// GET /api/communities/member/:userId - communities this user belongs to, visible to the viewer
router.get("/member/:userId", async (req, res) => {
  const db = await readDB();
  const list = db.communities.filter(
    (c) => c.memberIds.includes(req.params.userId) && visibleTo(db, c, req.user?.id)
  );
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list.map((c) => serializeCommunity(db, c, req.user?.id)));
});

// GET /api/communities/suggestions - communities you might want to join, ranked by your interest topics
router.get("/suggestions", async (req, res) => {
  const db = await readDB();
  const viewerId = req.user?.id;
  const viewer = viewerId ? findUserById(db, viewerId) : null;
  const interests = viewer?.interests || [];

  const candidates = db.communities.filter(
    (c) => visibleTo(db, c, viewerId) && !(viewerId && c.memberIds.includes(viewerId))
  );
  const byMemberCount = (a, b) => b.memberIds.length - a.memberIds.length;
  const matching = candidates.filter((c) => c.topics?.some((t) => interests.includes(t))).sort(byMemberCount);
  const rest = candidates.filter((c) => !c.topics?.some((t) => interests.includes(t))).sort(byMemberCount);

  const sorted = [...matching, ...rest].slice(0, 20);
  res.json(sorted.map((c) => serializeCommunity(db, c, viewerId)));
});

// GET /api/communities/:id - detail (404 if not visible to the viewer)
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const community = db.communities.find((c) => c.id === req.params.id);
  if (!community || !visibleTo(db, community, req.user?.id)) {
    return res.status(404).json({ error: "Community not found" });
  }
  res.json(serializeCommunity(db, community, req.user?.id));
});

// GET /api/communities/:id/members - member list (anyone who can view the community)
router.get("/:id/members", async (req, res) => {
  const db = await readDB();
  const community = db.communities.find((c) => c.id === req.params.id);
  if (!community || !visibleTo(db, community, req.user?.id)) {
    return res.status(404).json({ error: "Community not found" });
  }
  const list = community.memberIds
    .map((id) => findUserById(db, id))
    .filter(Boolean)
    .map((u) => ({ ...serializeUserSummary(db, u, req.user?.id), isAdmin: u.id === community.creatorId }));
  res.json(list);
});

// GET /api/communities/:id/join-requests - pending join requests (admin-only)
router.get("/:id/join-requests", requireAuth, async (req, res) => {
  const db = await readDB();
  const community = db.communities.find((c) => c.id === req.params.id);
  if (!community) return res.status(404).json({ error: "Community not found" });
  if (community.creatorId !== req.user.id) {
    return res.status(403).json({ error: "Only the community admin can view join requests" });
  }
  const list = (db.communityJoinRequests || [])
    .filter((r) => r.communityId === community.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      user: (() => {
        const u = findUserById(db, r.userId);
        return u ? serializeUserSummary(db, u, req.user.id) : null;
      })(),
    }))
    .filter((r) => r.user);
  res.json(list);
});

// POST /api/communities - create { name, nickname, description, visibility, topics }
router.post("/", requireAuth, async (req, res) => {
  const { name, nickname, description, visibility, topics } = req.body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (name.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `name must be ${MAX_NAME_LENGTH} characters or fewer` });
  }
  if (typeof nickname !== "string" || !NICKNAME_RE.test(nickname)) {
    return res.status(400).json({
      error: "nickname must start with @ and be 3-30 letters, digits, or underscores",
    });
  }
  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    return res.status(400).json({ error: `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer` });
  }
  if (visibility !== "public" && visibility !== "private") {
    return res.status(400).json({ error: "visibility must be 'public' or 'private'" });
  }

  const result = await withDB((db) => {
    const existing = findCommunityByNickname(db, nickname);
    if (existing) return { status: 409, error: "This community nickname is already taken" };

    const community = {
      id: randomUUID(),
      name: name.trim(),
      nickname,
      description: (description || "").trim(),
      visibility,
      topics: cleanTopics(topics),
      creatorId: req.user.id,
      memberIds: [req.user.id],
      createdAt: new Date().toISOString(),
    };
    db.communities.push(community);
    return { payload: serializeCommunity(db, community, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.status(201).json(result.payload);
});

// PATCH /api/communities/:id - edit description/topics (admin-only)
router.patch("/:id", requireAuth, async (req, res) => {
  const { description, topics } = req.body ?? {};
  if (description !== undefined && description.length > MAX_DESCRIPTION_LENGTH) {
    return res.status(400).json({ error: `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer` });
  }

  const result = await withDB((db) => {
    const community = db.communities.find((c) => c.id === req.params.id);
    if (!community) return { status: 404, error: "Community not found" };
    if (community.creatorId !== req.user.id) {
      return { status: 403, error: "Only the community admin can edit this community" };
    }

    if (description !== undefined) community.description = description.trim();
    if (topics !== undefined) community.topics = cleanTopics(topics);

    return { payload: serializeCommunity(db, community, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// DELETE /api/communities/:id - delete the community and its posts (admin-only)
router.delete("/:id", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const community = db.communities.find((c) => c.id === req.params.id);
    if (!community) return { status: 404, error: "Community not found" };
    if (community.creatorId !== req.user.id) {
      return { status: 403, error: "Only the community admin can delete this community" };
    }

    const postIds = new Set(db.posts.filter((p) => p.communityId === community.id).map((p) => p.id));
    db.posts = db.posts.filter((p) => p.communityId !== community.id);
    db.comments = db.comments.filter((c) => !postIds.has(c.postId));
    db.communityJoinRequests = (db.communityJoinRequests || []).filter((r) => r.communityId !== community.id);
    db.communities = db.communities.filter((c) => c.id !== community.id);

    return { payload: { ok: true } };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// DELETE /api/communities/:id/members/:userId - remove a member (admin-only)
router.delete("/:id/members/:userId", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const community = db.communities.find((c) => c.id === req.params.id);
    if (!community) return { status: 404, error: "Community not found" };
    if (community.creatorId !== req.user.id) {
      return { status: 403, error: "Only the community admin can remove members" };
    }
    if (req.params.userId === community.creatorId) {
      return { status: 400, error: "The admin cannot be removed from their own community" };
    }

    community.memberIds = community.memberIds.filter((id) => id !== req.params.userId);
    return { payload: serializeCommunity(db, community, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// POST /api/communities/:id/join-requests/:userId/accept (admin-only)
router.post("/:id/join-requests/:userId/accept", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const community = db.communities.find((c) => c.id === req.params.id);
    if (!community) return { status: 404, error: "Community not found" };
    if (community.creatorId !== req.user.id) {
      return { status: 403, error: "Only the community admin can accept join requests" };
    }
    const request = (db.communityJoinRequests || []).find(
      (r) => r.communityId === community.id && r.userId === req.params.userId
    );
    if (!request) return { status: 404, error: "Join request not found" };

    db.communityJoinRequests = db.communityJoinRequests.filter((r) => r.id !== request.id);
    if (!community.memberIds.includes(request.userId)) community.memberIds.push(request.userId);
    addNotification(db, {
      recipientId: request.userId,
      type: "community_join_accepted",
      actorId: req.user.id,
      communityId: community.id,
    });

    return { payload: serializeCommunity(db, community, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// POST /api/communities/:id/join-requests/:userId/decline (admin-only)
router.post("/:id/join-requests/:userId/decline", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const community = db.communities.find((c) => c.id === req.params.id);
    if (!community) return { status: 404, error: "Community not found" };
    if (community.creatorId !== req.user.id) {
      return { status: 403, error: "Only the community admin can decline join requests" };
    }
    db.communityJoinRequests = (db.communityJoinRequests || []).filter(
      (r) => !(r.communityId === community.id && r.userId === req.params.userId)
    );
    return { payload: { ok: true } };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// POST /api/communities/:id/join - join a public community, or request/cancel-request for a private one
router.post("/:id/join", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const community = db.communities.find((c) => c.id === req.params.id);
    if (!community || !visibleTo(db, community, req.user.id)) {
      return { status: 404, error: "Community not found" };
    }
    if (community.memberIds.includes(req.user.id)) {
      return { payload: serializeCommunity(db, community, req.user.id) };
    }

    if (community.visibility === "private") {
      db.communityJoinRequests = db.communityJoinRequests || [];
      const existingIndex = db.communityJoinRequests.findIndex(
        (r) => r.communityId === community.id && r.userId === req.user.id
      );
      if (existingIndex !== -1) {
        db.communityJoinRequests.splice(existingIndex, 1);
      } else {
        db.communityJoinRequests.push({
          id: randomUUID(),
          communityId: community.id,
          userId: req.user.id,
          createdAt: new Date().toISOString(),
        });
        addNotification(db, {
          recipientId: community.creatorId,
          type: "community_join_request",
          actorId: req.user.id,
          communityId: community.id,
        });
      }
      return { payload: serializeCommunity(db, community, req.user.id) };
    }

    community.memberIds.push(req.user.id);
    return { payload: serializeCommunity(db, community, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// POST /api/communities/:id/leave
router.post("/:id/leave", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const community = db.communities.find((c) => c.id === req.params.id);
    if (!community) return { status: 404, error: "Community not found" };
    if (community.creatorId === req.user.id) {
      return { status: 400, error: "The creator cannot leave their own community" };
    }
    community.memberIds = community.memberIds.filter((id) => id !== req.user.id);
    return { payload: serializeCommunity(db, community, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

export default router;
