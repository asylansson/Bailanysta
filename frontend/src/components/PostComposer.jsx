import { useState, useRef, useEffect } from "react";
import Avatar from "./Avatar.jsx";
import { randomStatus } from "../statusPhrases.js";
import { suggestHashtags } from "../hashtagSuggester.js";
import { useI18n } from "../i18n/I18nContext.jsx";

const MAX_LENGTH = 1000;

const actionButtonClass =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-400 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/40 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 hover:border-violet-300 dark:hover:border-violet-600 active:scale-90 transition-all duration-150 disabled:opacity-50 disabled:active:scale-100";

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" stroke="none">
      <path d="M11 2.5 12.6 8l5.4 1.6-5.4 1.6L11 16.7 9.4 11.2 4 9.6l5.4-1.6L11 2.5Z" />
      <path d="M18.5 13.5 19.4 16l2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.5Z" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M9 4 7 20M17 4l-2 16M4 9h16M3 15h16" />
    </svg>
  );
}

export default function PostComposer({ user, onSubmit }) {
  const { t, language } = useI18n();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);
  const [hashtagStatus, setHashtagStatus] = useState(null); // null | "added" | "already" | "none"
  const [ideaPop, setIdeaPop] = useState(false);
  const [hashtagPop, setHashtagPop] = useState(false);
  const publishedTimeoutRef = useRef(null);
  const hashtagStatusTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(publishedTimeoutRef.current);
      clearTimeout(hashtagStatusTimeoutRef.current);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ text: trimmed });
      setText("");
      setPublished(true);
      clearTimeout(publishedTimeoutRef.current);
      publishedTimeoutRef.current = setTimeout(() => setPublished(false), 2000);
    } catch (err) {
      setError(err.message || t("post.publishError"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleRandomStatus() {
    setText(randomStatus(language));
    setIdeaPop(true);
    setTimeout(() => setIdeaPop(false), 420);
  }

  function showHashtagStatus(status) {
    setHashtagStatus(status);
    clearTimeout(hashtagStatusTimeoutRef.current);
    hashtagStatusTimeoutRef.current = setTimeout(() => setHashtagStatus(null), 2000);
  }

  function handleSuggestHashtags() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setHashtagPop(true);
    setTimeout(() => setHashtagPop(false), 420);

    const hashtags = suggestHashtags(trimmed, language);
    if (hashtags.length === 0) {
      showHashtagStatus("none");
      return;
    }

    const lowerText = trimmed.toLowerCase();
    const newHashtags = hashtags.filter((h) => !lowerText.includes(h.toLowerCase()));
    if (newHashtags.length === 0) {
      showHashtagStatus("already");
      return;
    }

    const withTags = `${trimmed} ${newHashtags.join(" ")}`.slice(0, MAX_LENGTH);
    setText(withTags);
    showHashtagStatus("added");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-4 flex gap-3"
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        <Avatar name={user.name} picture={user.picture} presetId={user.avatarPreset} />
        <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
          {text.length}/{MAX_LENGTH}
        </span>
      </div>
      <div className="flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={3}
          placeholder={t("post.placeholder")}
          className="w-full resize-none rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <button type="button" onClick={handleRandomStatus} className={actionButtonClass}>
            <span className={ideaPop ? "pop-animate" : ""}>
              <SparklesIcon />
            </span>
            {t("post.randomIdea")}
          </button>
          <button type="button" onClick={handleSuggestHashtags} disabled={!text.trim()} className={actionButtonClass}>
            <span className={hashtagPop ? "pop-animate" : ""}>
              <HashIcon />
            </span>
            {t("post.hashtags")}
          </button>
          {hashtagStatus === "added" && (
            <span className="text-xs text-green-600 dark:text-green-400">{t("post.hashtagsAdded")}</span>
          )}
          {hashtagStatus === "already" && (
            <span className="text-xs text-green-600 dark:text-green-400">{t("post.hashtagsAlready")}</span>
          )}
          {hashtagStatus === "none" && (
            <span className="text-xs text-green-600 dark:text-green-400">{t("post.noHashtagsFound")}</span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? t("post.publishing") : t("post.publish")}
            </button>
            {published && <span className="text-sm text-green-600 dark:text-green-400">{t("post.published")}</span>}
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </form>
  );
}
