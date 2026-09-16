import { Router } from "express";
import { readDB, withDB } from "../db.js";
import { serializeNotification } from "../helpers.js";
import { requireAuth } from "../auth.js";

const router = Router();

function sortByNewest(items) {
  return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// GET /api/notifications - my notifications, newest first
router.get("/", requireAuth, async (req, res) => {
  const db = await readDB();
  const items = db.notifications.filter((n) => n.recipientId === req.user.id);
  res.json(sortByNewest(items).map((n) => serializeNotification(db, n)));
});

// POST /api/notifications/read - mark all of mine as read
router.post("/read", requireAuth, async (req, res) => {
  await withDB((db) => {
    db.notifications.forEach((n) => {
      if (n.recipientId === req.user.id) n.read = true;
    });
  });

  res.json({ ok: true });
});

export default router;
