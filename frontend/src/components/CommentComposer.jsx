import { useState } from "react";
import { useI18n } from "../i18n/I18nContext.jsx";

const MAX_LENGTH = 500;

export default function CommentComposer({ onSubmit, placeholder, autoFocus = false, onCancel }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(trimmed);
      setText("");
      if (onCancel) onCancel();
    } catch (err) {
      setError(err.message || t("comment.sendError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={2}
        autoFocus={autoFocus}
        placeholder={placeholder || t("comment.placeholder")}
        className="w-full resize-none rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{text.length}/{MAX_LENGTH}</span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="px-3 py-1 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "..." : t("common.send")}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
