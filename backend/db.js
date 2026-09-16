import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");

const EMPTY_DB = {
  users: [],
  posts: [],
  comments: [],
  follows: [],
  followRequests: [],
  notifications: [],
  conversations: [],
  messages: [],
  communities: [],
  communityJoinRequests: [],
};

// db.json is gitignored (it can contain real signed-in users' data), so a
// fresh clone won't have one - bootstrap an empty database on first read
// instead of crashing.
async function readDBRaw() {
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    await mkdir(path.dirname(DB_PATH), { recursive: true });
    await writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf-8");
    return structuredClone(EMPTY_DB);
  }
}

async function writeDBRaw(data) {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// All requests share one Express process and this one queue, so chaining every
// mutation onto it serializes read-modify-write cycles - two concurrent likes
// or edits can no longer race and silently overwrite each other.
let queue = Promise.resolve();

export function readDB() {
  return queue.then(readDBRaw);
}

export function withDB(mutator) {
  const result = queue.then(async () => {
    const db = await readDBRaw();
    const returnValue = await mutator(db);
    await writeDBRaw(db);
    return returnValue;
  });
  queue = result.catch(() => {});
  return result;
}
