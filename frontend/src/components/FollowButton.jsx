import { useI18n } from "../i18n/I18nContext.jsx";

export default function FollowButton({ isFollowing, followRequestPending, isPrivate, onToggle, disabled }) {
  const { t } = useI18n();
  const pending = !isFollowing && followRequestPending;
  const label = isFollowing
    ? t("profile.unfollow")
    : pending
    ? t("profile.requested")
    : isPrivate
    ? t("profile.request")
    : t("profile.follow");

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        isFollowing || pending
          ? "border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950"
          : "bg-violet-600 text-white hover:bg-violet-700"
      }`}
    >
      {label}
    </button>
  );
}
