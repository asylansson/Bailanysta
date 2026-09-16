import { Router } from "express";
import { withDB } from "../db.js";
import { serializeComment, addNotification } from "../helpers.js";
import { requireAuth } from "../auth.js";

const router = Router();

// POST /api/comments/:id/like - toggle like
router.post("/:id/like", requireAuth, async (req, res) => {
  const result = await withDB((db) => {
    const comment = db.comments.find((c) => c.id === req.params.id);
    if (!comment) return { status: 404, error: "Comment not found" };

    const likedIndex = comment.likedBy.indexOf(req.user.id);
    if (likedIndex === -1) {
      comment.likedBy.push(req.user.id);
      addNotification(db, {
        recipientId: comment.authorId,
        type: "like_comment",
        actorId: req.user.id,
        postId: comment.postId,
        commentId: comment.id,
      });
    } else {
      comment.likedBy.splice(likedIndex, 1);
    }

    return { payload: serializeComment(db, comment, req.user.id) };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result.payload);
});

export default router;
