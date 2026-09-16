import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const SESSION_TTL = "30d";

// Reads env vars lazily (not at module load) - server.js loads backend/.env
// via a hoisted-import-safe path, but this module is itself pulled in by
// those same hoisted imports, so a module-level `const X = process.env.X`
// here would freeze in as `undefined` before .env is ever read.
let googleClient;
function getGoogleClient() {
  if (!googleClient) googleClient = new OAuth2Client();
  return googleClient;
}

// Verifies a Google Identity Services credential (ID token) and returns the
// verified profile. Throws if the token is invalid, expired, or was issued
// for a different Google client.
export async function verifyGoogleCredential(credential) {
  const ticket = await getGoogleClient().verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    givenName: payload.given_name || null,
    familyName: payload.family_name || null,
    picture: payload.picture || null,
  };
}

// Our own session token, issued after Google verification succeeds, so the
// rest of the app never has to re-verify a Google token on every request.
export function signSession(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: SESSION_TTL,
  });
}

function readBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

// Attaches req.user when a valid session token is present; never blocks the
// request otherwise. Use this on routes that behave differently for a signed-in
// viewer but are still readable by anyone (e.g. computing "likedByMe").
export function optionalAuth(req, res, next) {
  const token = readBearerToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.sub, email: payload.email, name: payload.name };
    } catch {
      // invalid/expired token - proceed as an anonymous viewer
    }
  }
  next();
}

// Rejects the request with 401 unless a valid session token is present.
export function requireAuth(req, res, next) {
  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ error: "Sign in required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}
