import { useState } from "react";
import { updateCommunity } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import TopicsPicker from "./TopicsPicker.jsx";

export default function EditCommunityModal({ community, onUpdated, onClose }) {
  const { t } = useI18n();
  const [description, setDescription] = useState(community.description || "");
  const [topics, setTopics] = useState(community.topics || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateCommunity(community.id, { description: description.trim(), topics });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/40 modal-overlay-enter" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-violet-400 dark:border-violet-900 modal-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-400 dark:border-violet-900">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t("communities.editCommunity")}</h2>
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

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("communities.descriptionPlaceholder")}
            maxLength={300}
            rows={3}
            className="w-full resize-none rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t("communities.topicsLabel")}</p>
            <TopicsPicker value={topics} onChange={setTopics} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40"
          >
            {saving ? t("common.saving") : t("communities.saveChanges")}
          </button>
        </form>
      </div>
    </div>
  );
}
