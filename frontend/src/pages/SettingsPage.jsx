import { useState } from "react";
import { updateMySettings } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import { clearSearchHistory } from "../searchHistory.js";
import AvatarPicker from "../components/AvatarPicker.jsx";
import Avatar from "../components/Avatar.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";
import TopicsPicker from "../components/TopicsPicker.jsx";

const LANGUAGES = [
  { code: "kk", key: "languageKk" },
  { code: "ru", key: "languageRu" },
  { code: "en", key: "languageEn" },
];

export default function SettingsPage({ currentUser, onUserUpdate }) {
  const { t, language, setLanguage } = useI18n();
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [nickname, setNickname] = useState(currentUser?.nickname || "");
  const [avatarPreset, setAvatarPreset] = useState(currentUser?.avatarPreset || null);
  const [interests, setInterests] = useState(currentUser?.interests || []);
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-gray-500 dark:text-gray-400">{t("profileGate.subtitle")}</p>
      </div>
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError(t("settings.firstNameRequired"));
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const nicknameValue = nickname.trim();
      const updated = await updateMySettings({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nicknameValue || null,
        avatarPreset,
        interests,
        isPrivate,
      });
      onUserUpdate(updated);
      setSaved(true);
    } catch (err) {
      const msg = err.message || "";
      if (/nickname is already taken/i.test(msg)) setError(t("settings.nicknameTaken"));
      else if (/nickname must start with @/i.test(msg)) setError(t("settings.nicknameInvalid"));
      else if (/first name is required/i.test(msg)) setError(t("settings.firstNameRequired"));
      else if (/must be 30 characters/i.test(msg)) setError(t("settings.nameTooLong"));
      else setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleLanguageClick(code) {
    setLanguage(code);
    if (currentUser) {
      try {
        const updated = await updateMySettings({ language: code });
        onUserUpdate(updated);
      } catch {
        // language still switches locally even if persisting server-side fails
      }
    }
  }

  function handleClearHistory() {
    clearSearchHistory(currentUser.id);
    setHistoryCleared(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative flex items-center justify-center mb-6">
        <BackHomeButton />
        <h1 className="page-title text-xl font-bold tracking-tight text-violet-700 dark:text-violet-300">
          {t("settings.title")}
        </h1>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} picture={currentUser.picture} presetId={avatarPreset} size="lg" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("settings.chooseAvatar")}</p>
            <AvatarPicker value={avatarPreset} onChange={setAvatarPreset} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settings.firstName")}</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={30}
              required
              className="w-full rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settings.lastName")}</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={30}
              className="w-full rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settings.nickname")}</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="@username"
            maxLength={20}
            className="w-full rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-400">{t("settings.nicknameHint")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settings.interests")}</label>
          <p className="mb-2 text-xs text-gray-400">{t("settings.interestsHint")}</p>
          <TopicsPicker value={interests} onChange={setInterests} />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-violet-600"
          />
          <span>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("settings.privateAccount")}</span>
            <span className="block text-xs text-gray-400">{t("settings.privateAccountHint")}</span>
          </span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !firstName.trim()}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40"
          >
            {saving ? t("common.saving") : t("settings.save")}
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400">{t("settings.saved")}</span>}
        </div>
      </form>

      <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("settings.language")}</label>
        <div className="flex items-center gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleLanguageClick(l.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                language === l.code
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {t(`settings.${l.key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("settings.searchHistory")}</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearHistory}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {t("settings.clearSearchHistory")}
          </button>
          {historyCleared && <span className="text-sm text-green-600 dark:text-green-400">{t("settings.historyCleared")}</span>}
        </div>
      </div>
    </div>
  );
}
