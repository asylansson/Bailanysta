import { Router } from "express";
import { withDB } from "../db.js";
import { verifyGoogleCredential, signSession } from "../auth.js";
import { getOrCreateGoogleUser, serializeMe } from "../helpers.js";

const router = Router();

// POST /api/auth/google - exchange a Google ID token for our own session token
router.post("/google", async (req, res) => {
  const { credential } = req.body ?? {};
  if (typeof credential !== "string" || !credential) {
    return res.status(400).json({ error: "credential is required" });
  }

  let profile;
  try {
    profile = await verifyGoogleCredential(credential);
  } catch {
    return res.status(401).json({ error: "Invalid Google credential" });
  }

  const user = await withDB((db) => getOrCreateGoogleUser(db, profile));

  const token = signSession(user);
  res.json({ token, user: serializeMe(user) });
});

export default router;
