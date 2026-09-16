import { Router } from "express";
import { randomUUID } from "crypto";
import { readDB, withDB } from "../db.js";
import { serializeComment, buildCommentTree, addNotification } from "../helpers.js";
import { requireAuth } from "../auth.js";

// Mounted at /api/posts/:postId/comments
const router = Router({ mergeParams: true });
const MAX_COMMENT_LENGTH = 500;

// GET /api/posts/:postId/comments - full nested thread
router.get("/", async (req, res) => {
  const db = await readDB();
  const comments = db.comments.filter((c) => c.postId === req.params.postId);
  const serialized = comments.map((c) => serializeComment(db, c, req.user?.id));
  res.json(buildCommentTree(serialized));
});

// POST /api/posts/:postId/comments - create a comment or reply { text, parentId? }
router.post("/", requireAuth, async (req, res) => {
  const { text, parentId } = req.body ?? {};

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }
  if (text.length > MAX_COMMENT_LENGTH) {
    return res.status(400).json({ error: `text must be ${MAX_COMMENT_LENGTH} characters or fewer` });
  }

  const result = await withDB((db) => {
    const post = db.posts.find((p) => p.id === req.params.postId);
    if (!post) return { status: 404, error: "Post not found" };

    let parent = null;
    if (parentId) {
      parent = db.comments.find((c) => c.id === parentId && c.postId === post.id);
      if (!parent) return { status: 400, error: "Parent comment not found" };
    }

    const comment = {
      id: randomUUID(),
      postId: post.id,
      parentId: parent ? parent.id : null,
      authorId: req.user.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likedBy: [],
    };
    db.comments.push(comment);

    addNotification(db, {
      recipientId: parent ? parent.authorId : post.authorId,
      type: parent ? "reply" : "comment",
      actorId: req.user.id,
      postId: post.id,
      commentId: comment.id,
    });

    return { payload: serializeComment(db, comment, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.status(201).json(result.payload);
});

export default router;
