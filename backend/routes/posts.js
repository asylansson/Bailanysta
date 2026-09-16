import { Router } from "express";
import { randomUUID } from "crypto";
import { readDB, withDB } from "../db.js";
import {
  serializePost,
  addNotification,
  canViewCommunityPosts,
  findUserById,
  canViewUserContent,
  detectPostLanguage,
} from "../helpers.js";
import { requireAuth } from "../auth.js";
import { TOPIC_IDS } from "../topics.js";

const router = Router();
const MAX_POST_LENGTH = 1000;
const RECOMMENDATIONS_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

function sortByNewest(posts) {
  return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function sortByHot(posts) {
  return [...posts].sort((a, b) => {
    const likeDiff = b.likedBy.length - a.likedBy.length;
    if (likeDiff !== 0) return likeDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function normalizeText(text, maxLength) {
  if (typeof text !== "string" || !text.trim()) {
    return { error: "text is required" };
  }
  if (text.length > maxLength) {
    return { error: `text must be ${maxLength} characters or fewer` };
  }
  return { value: text.trim() };
}

// GET /api/posts?q=keyword&communityId=&tab=recommendations|following - feed (or one community's posts)
router.get("/", async (req, res) => {
  const db = await readDB();
  const { q, communityId, tab, lang } = req.query;

  let posts;
  let sorted;
  if (communityId) {
    const community = db.communities.find((c) => c.id === communityId);
    if (!community || !canViewCommunityPosts(db, community, req.user?.id)) {
      return res.status(404).json({ error: "Community not found" });
    }
    posts = db.posts.filter((p) => p.communityId === communityId);
    sorted = sortByNewest(posts);
  } else if (tab === "following" && req.user) {
    // Subscriptions tab: posts from people you follow (one-directional) and communities
    // you're a member of, excluding your own posts, most recent first.
    const followingIds = new Set(
      db.follows.filter((f) => f.followerId === req.user.id).map((f) => f.followingId)
    );
    const memberCommunityIds = new Set(
      db.communities.filter((c) => c.memberIds.includes(req.user.id)).map((c) => c.id)
    );
    posts = db.posts.filter(
      (p) =>
        p.authorId !== req.user.id &&
        ((!p.communityId && followingIds.has(p.authorId)) ||
          (p.communityId && memberCommunityIds.has(p.communityId)))
    );
    sorted = sortByNewest(posts);
  } else {
    // Recommendations tab (default, also for guests): last 3 days, ranked by the viewer's
    // chosen interest topics first (each group most-liked first), then everything else.
    // Private authors are excluded unless the viewer already follows them.
    const cutoff = Date.now() - RECOMMENDATIONS_WINDOW_MS;
    posts = db.posts.filter(
      (p) =>
        !p.communityId &&
        new Date(p.createdAt).getTime() >= cutoff &&
        canViewUserContent(db, p.authorId, req.user?.id)
    );

    const viewer = req.user ? findUserById(db, req.user.id) : null;
    const interests = viewer?.interests || [];
    if (interests.length > 0) {
      const matching = posts.filter((p) => p.topic && interests.includes(p.topic));
      const rest = posts.filter((p) => !(p.topic && interests.includes(p.topic)));
      sorted = [...sortByHot(matching), ...sortByHot(rest)];
    } else {
      sorted = sortByHot(posts);
    }
  }

  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    sorted = sorted.filter((p) => p.text.toLowerCase().includes(needle));
  }

  if (lang === "kk" || lang === "ru" || lang === "en") {
    sorted = sorted.filter((p) => detectPostLanguage(p.text) === lang);
  }

  res.json(sorted.map((p) => serializePost(db, p, req.user?.id)));
});

// GET /api/posts/author/:userId - posts by a single author, newest first
router.get("/author/:userId", async (req, res) => {
  const db = await readDB();
  if (!canViewUserContent(db, req.params.userId, req.user?.id)) return res.json([]);
  const posts = db.posts.filter((p) => p.authorId === req.params.userId);
  res.json(sortByNewest(posts).map((p) => serializePost(db, p, req.user?.id)));
});

// GET /api/posts/:id - single post
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!post.communityId && !canViewUserContent(db, post.authorId, req.user?.id)) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(serializePost(db, post, req.user?.id));
});

// POST /api/posts - create a post { text, communityId?, topic? }
router.post("/", requireAuth, async (req, res) => {
  const cleanText = normalizeText(req.body?.text, MAX_POST_LENGTH);
  if (cleanText.error) return res.status(400).json({ error: cleanText.error });
  const { communityId, topic } = req.body ?? {};
  const cleanTopic = TOPIC_IDS.includes(topic) ? topic : null;

  const result = await withDB((db) => {
    if (communityId) {
      const community = db.communities.find((c) => c.id === communityId);
      if (!community) return { status: 404, error: "Community not found" };
      if (!community.memberIds.includes(req.user.id)) {
        return { status: 403, error: "Join the community before posting in it" };
      }
    }

    const post = {
      id: randomUUID(),
      authorId: req.user.id,
      communityId: communityId || null,
      topic: cleanTopic,
      text: cleanText.value,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      likedBy: [],
    };
    db.posts.push(post);
    return { payload: serializePost(db, post, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.status(201).json(result.payload);
});

// PATCH /api/posts/:id - edit a post { text } (author-only)
router.patch("/:id", requireAuth, async (req, res) => {
  const cleanText = normalizeText(req.body?.text, MAX_POST_LENGTH);
  if (cleanText.error) return res.status(400).json({ error: cleanText.error });

  const result = await withDB((db) => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) return { status: 404, error: "Post not found" };
    if (post.authorId !== req.user.id) {
      return { status: 403, error: "Only the author can edit this post" };
    }

    post.text = cleanText.value;
    post.updatedAt = new Date().toISOString();
    return { payload: serializePost(db, post, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

// POST /api/posts/:id/like - toggle like
router.post("/:id/like", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) return { status: 404, error: "Post not found" };

    const likedIndex = post.likedBy.indexOf(req.user.id);
    if (likedIndex === -1) {
      post.likedBy.push(req.user.id);
      addNotification(db, {
        recipientId: post.authorId,
        type: "like_post",
        actorId: req.user.id,
        postId: post.id,
      });
    } else {
      post.likedBy.splice(likedIndex, 1);
    }

    return { payload: serializePost(db, post, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

export default router;
