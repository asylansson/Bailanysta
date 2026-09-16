import { fileURLToPath } from "url";
import path from "path";

try {
  process.loadEnvFile(path.join(path.dirname(fileURLToPath(import.meta.url)), ".env"));
} catch {
  // no .env file yet - fine if JWT_SECRET/GOOGLE_CLIENT_ID are set another way
}

import express from "express";
import cors from "cors";
import { withDB } from "./db.js";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";
import postCommentsRouter from "./routes/postComments.js";
import commentsRouter from "./routes/comments.js";
import usersRouter from "./routes/users.js";
import notificationsRouter from "./routes/notifications.js";
import messagesRouter from "./routes/messages.js";
import communitiesRouter from "./routes/communities.js";
import searchRouter from "./routes/search.js";
import { optionalAuth } from "./auth.js";

if (!process.env.JWT_SECRET || !process.env.GOOGLE_CLIENT_ID) {
  console.warn(
    "Warning: JWT_SECRET or GOOGLE_CLIENT_ID is not set in backend/.env - Google sign-in will not work."
  );
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(optionalAuth);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/posts/:postId/comments", postCommentsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/conversations", messagesRouter);
app.use("/api/communities", communitiesRouter);
app.use("/api/search", searchRouter);

// One-time migration: every user needs a small sequential publicId, used as
// their profile URL when they haven't set a nickname (accounts created
// before this field existed won't have one yet).
await withDB((db) => {
  let nextId = db.users.reduce((max, u) => Math.max(max, u.publicId || 0), 0) + 1;
  for (const user of db.users) {
    if (!user.publicId) user.publicId = nextId++;
  }
});

app.listen(PORT, () => {
  console.log(`Bailanysta API listening on http://localhost:${PORT}`);
});
