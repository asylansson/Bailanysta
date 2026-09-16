import { Router } from "express";
import { randomUUID } from "crypto";
import { readDB, withDB } from "../db.js";
import { findUserById, isMutualFollow, serializeUserSummary, displayName } from "../helpers.js";
import { requireAuth } from "../auth.js";

const router = Router();
const MAX_MESSAGE_LENGTH = 2000;

function conversationKey(aId, bId) {
  return [aId, bId].sort().join(":");
}

function findConversation(db, aId, bId) {
  const key = conversationKey(aId, bId);
  return db.conversations.find((c) => conversationKey(c.memberIds[0], c.memberIds[1]) === key);
}

// GET /api/conversations?q= - inbox: one row per mutual friend I've messaged, newest first.
// With ?q=, also searches the full message history of each conversation (not just the
// last message) - a match on message text previews that message instead of the actual
// last message, so you can find "the chat where I mentioned X" even if X wasn't the most
// recent thing said there.
router.get("/", requireAuth, async (req, res) => {
  const db = await readDB();
  const mine = db.conversations.filter((c) => c.memberIds.includes(req.user.id));
  const q = (req.query.q || "").trim().toLowerCase();

  const rows = mine
    .map((c) => {
      const otherId = c.memberIds.find((id) => id !== req.user.id);
      const other = findUserById(db, otherId);
      const name = other ? displayName(other) : "Удалённый пользователь";
      const msgs = [...db.messages.filter((m) => m.conversationId === c.id)].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const last = msgs[msgs.length - 1] || null;
      const unreadCount = msgs.filter((m) => m.senderId !== req.user.id && !m.readBy.includes(req.user.id)).length;

      let preview = last;
      if (q) {
        const nameMatches = name.toLowerCase().includes(q);
        const matchingMessages = msgs.filter((m) => m.text.toLowerCase().includes(q));
        if (!nameMatches && matchingMessages.length === 0) return null;
        if (matchingMessages.length > 0) preview = matchingMessages[matchingMessages.length - 1];
      }

      return {
        userId: otherId,
        name,
        picture: other ? other.picture : null,
        avatarPreset: other ? other.avatarPreset : null,
        lastMessage: preview ? preview.text : null,
        lastMessageAt: preview ? preview.createdAt : c.createdAt,
        unreadCount,
      };
    })
    .filter(Boolean);

  rows.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  res.json(rows);
});

// GET /api/conversations/:userId - status + other user's info (no messages if not mutual friends)
router.get("/:userId", requireAuth, async (req, res) => {
  const db = await readDB();
  const other = findUserById(db, req.params.userId);
  if (!other) return res.status(404).json({ error: "User not found" });

  res.json({
    otherUser: serializeUserSummary(db, other, req.user.id),
    isMutualFriend: isMutualFollow(db, req.user.id, other.id),
  });
});

// GET /api/conversations/:userId/messages - full thread (mutual friends only)
router.get("/:userId/messages", requireAuth, async (req, res) => {
  const db = await readDB();
  const other = findUserById(db, req.params.userId);
  if (!other) return res.status(404).json({ error: "User not found" });
  if (!isMutualFollow(db, req.user.id, other.id)) {
    return res.status(403).json({ error: "You must follow each other to message" });
  }

  const conversation = findConversation(db, req.user.id, other.id);
  const msgs = conversation ? db.messages.filter((m) => m.conversationId === conversation.id) : [];
  const sorted = [...msgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  res.json(
    sorted.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      text: m.text,
      createdAt: m.createdAt,
    }))
  );
});

// POST /api/conversations/:userId/messages - send a message { text } (mutual friends only)
router.post("/:userId/messages", requireAuth, async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `text must be ${MAX_MESSAGE_LENGTH} characters or fewer` });
  }

  const result = await withDB((db) => {
    const other = findUserById(db, req.params.userId);
    if (!other) return { status: 404, error: "User not found" };
    if (!isMutualFollow(db, req.user.id, other.id)) {
      return { status: 403, error: "You must follow each other to message" };
    }

    let conversation = findConversation(db, req.user.id, other.id);
    if (!conversation) {
      conversation = {
        id: randomUUID(),
        memberIds: [req.user.id, other.id],
        createdAt: new Date().toISOString(),
      };
      db.conversations.push(conversation);
    }

    const message = {
      id: randomUUID(),
      conversationId: conversation.id,
      senderId: req.user.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      readBy: [req.user.id],
    };
    db.messages.push(message);

    return { payload: { id: message.id, senderId: message.senderId, text: message.text, createdAt: message.createdAt } };
  });

  if (result.error) return res.status(result.status).json({ error: result.error });
  res.status(201).json(result.payload);
});

// POST /api/conversations/:userId/read - mark this thread's incoming messages as read
router.post("/:userId/read", requireAuth, async (req, res) => {
  await withDB((db) => {
    const conversation = findConversation(db, req.user.id, req.params.userId);
    if (!conversation) return;
    db.messages.forEach((m) => {
      if (m.conversationId === conversation.id && m.senderId !== req.user.id && !m.readBy.includes(req.user.id)) {
        m.readBy.push(req.user.id);
      }
    });
  });
  res.json({ ok: true });
});

export default router;
