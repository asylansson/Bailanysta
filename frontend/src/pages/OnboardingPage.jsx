import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { updateMySettings } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import AvatarPicker from "../components/AvatarPicker.jsx";
import Avatar from "../components/Avatar.jsx";
import TopicsPicker from "../components/TopicsPicker.jsx";

export default function OnboardingPage({ currentUser, onUserUpdate }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [nickname, setNickname] = useState(currentUser?.nickname || "");
  const [avatarPreset, setAvatarPreset] = useState(currentUser?.avatarPreset || null);
  const [interests, setInterests] = useState(currentUser?.interests || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!currentUser) {
    return <Navigate to="/profile" replace />;
  }
  if (currentUser.onboarded) {
    return <Navigate to={`/u/${currentUser.id}`} replace />;
  }

  async function finish(patch) {
    setSaving(true);
    setError("");
    try {
      const updated = await updateMySettings({ ...patch, onboarded: true });
      onUserUpdate(updated);
      navigate(`/u/${currentUser.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nicknameValue = nickname.trim();
    finish({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nicknameValue || null,
      avatarPreset,
      interests,
    });
  }

  function handleSkip() {
    finish({});
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="page-title text-2xl font-bold text-violet-700 dark:text-violet-300">{t("onboarding.title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("onboarding.subtitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-5 space-y-5"
      >
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} picture={currentUser.picture} presetId={avatarPreset} size="lg" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("onboarding.chooseAvatar")}</p>
            <AvatarPicker value={avatarPreset} onChange={setAvatarPreset} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settings.firstName")}</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={50}
              className="w-full rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settings.lastName")}</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={50}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("onboarding.interestsLabel")}</label>
          <TopicsPicker value={interests} onChange={setInterests} />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40"
          >
            {saving ? t("onboarding.saving") : t("onboarding.continue")}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={saving}
            className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40"
          >
            {t("onboarding.skip")}
          </button>
        </div>
      </form>
    </div>
  );
}
