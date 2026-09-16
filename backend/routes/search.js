import { Router } from "express";
import { readDB } from "../db.js";
import { canViewCommunity, serializeCommunity, serializeUserSummary, displayName } from "../helpers.js";

const router = Router();

// GET /api/search?q= - find people and communities by name/nickname
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  if (!q) return res.json({ users: [], communities: [] });

  const db = await readDB();

  const users = db.users
    .filter((u) => {
      const name = displayName(u).toLowerCase();
      const nickname = (u.nickname || "").toLowerCase();
      return name.includes(q) || nickname.includes(q);
    })
    .slice(0, 20)
    .map((u) => serializeUserSummary(db, u, req.user?.id));

  const communities = db.communities
    .filter((c) => canViewCommunity(db, c, req.user?.id))
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, 20)
    .map((c) => serializeCommunity(db, c, req.user?.id));

  res.json({ users, communities });
});

export default router;
