import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCommunities, createCommunity } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import { PostSkeletonList } from "../components/Skeleton.jsx";
import TopicsPicker from "../components/TopicsPicker.jsx";
import CommunitySuggestionsModal from "../components/CommunitySuggestionsModal.jsx";

const elegantButtonClass =
  "px-3 py-1 rounded-full border border-violet-300 dark:border-violet-700 text-xs font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors";

const NICKNAME_RE = /^@[a-zA-Z0-9_]{3,30}$/;

function CreateCommunityModal({ onCreated, onClose }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [topics, setTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const nicknameValue = nickname.trim();
    if (!name.trim() || !nicknameValue) return;
    if (!NICKNAME_RE.test(nicknameValue)) {
      setError(t("communities.nicknameInvalid"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const community = await createCommunity({
        name: name.trim(),
        nickname: nicknameValue,
        description: description.trim(),
        visibility,
        topics,
      });
      onCreated(community);
    } catch (err) {
      const isTaken = /already taken/i.test(err.message || "");
      const isInvalid = /must start with @/i.test(err.message || "");
      setError(
        isTaken
          ? t("communities.nicknameTaken")
          : isInvalid
          ? t("communities.nicknameInvalid")
          : err.message || t("communities.createError")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/40 modal-overlay-enter" onClick={onClose}>
      <div
        className="w-full max-w-sm max-h-[85vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-violet-400 dark:border-violet-900 modal-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-400 dark:border-violet-900">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t("communities.createTitle")}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
            title={t("common.close")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("communities.namePlaceholder")}
            maxLength={60}
            autoFocus
            className="w-full rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <div>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t("communities.nicknamePlaceholder")}
              maxLength={31}
              className="w-full rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">{t("communities.nicknameHint")}</p>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("communities.descriptionPlaceholder")}
            maxLength={300}
            rows={2}
            className="w-full resize-none rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t("communities.topicsLabel")}</p>
            <TopicsPicker value={topics} onChange={setTopics} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="radio" checked={visibility === "public"} onChange={() => setVisibility("public")} />
              {t("communities.public")}
              <span className="text-xs text-gray-400">({t("communities.publicDesc")})</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="radio" checked={visibility === "private"} onChange={() => setVisibility("private")} />
              {t("communities.private")}
              <span className="text-xs text-gray-400">({t("communities.privateDesc")})</span>
            </label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!name.trim() || !nickname.trim() || submitting}
            className="w-full px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? t("common.saving") : t("communities.create")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CommunitiesPage({ currentUser, requireUser }) {
  const { t, tp } = useI18n();
  const [communities, setCommunities] = useState([]);
  const [status, setStatus] = useState("loading");
  const [showCreate, setShowCreate] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchCommunities({ q: query })
      .then((data) => {
        if (!cancelled) {
          setCommunities(data);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [currentUser, query]);

  function handleCreated(community) {
    setCommunities((prev) => [community, ...prev]);
    setShowCreate(false);
  }

  function handleCreateClick() {
    if (!requireUser()) return;
    setShowCreate(true);
  }

  function handleFindClick() {
    if (!requireUser()) return;
    setShowSuggestions(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative flex items-center justify-center mb-4">
        <h1 className="page-title text-xl font-bold tracking-tight text-violet-700 dark:text-violet-300">
          {t("communities.title")}
        </h1>
        <button onClick={handleFindClick} className={`absolute left-0 ${elegantButtonClass}`}>
          {t("communities.findCommunities")}
        </button>
        <button onClick={handleCreateClick} className={`absolute right-0 ${elegantButtonClass}`}>
          {t("communities.create")}
        </button>
      </div>

      <div className="relative mb-4">
        <svg
          viewBox="0 0 24 24"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3-3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("communities.searchPlaceholder")}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      {status === "loading" && <PostSkeletonList count={2} />}
      {status === "ready" && communities.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          {query.trim() ? t("communities.noSearchResults") : t("communities.empty")}
        </p>
      )}

      {status === "ready" && (
        <div className="space-y-3">
          {communities.map((c) => (
            <Link
              key={c.id}
              to={`/communities/${c.handle}`}
              className="block bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-4 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</h2>
                {c.nickname && <span className="text-xs text-gray-400">{c.nickname}</span>}
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  {c.visibility === "private" ? t("communities.private") : t("communities.public")}
                </span>
              </div>
              {c.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{c.description}</p>}
              <p className="mt-2 text-xs text-gray-400">{c.memberCount} {tp("communities.members", c.memberCount)}</p>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateCommunityModal onCreated={handleCreated} onClose={() => setShowCreate(false)} />}
      {showSuggestions && <CommunitySuggestionsModal onClose={() => setShowSuggestions(false)} />}
    </div>
  );
}
