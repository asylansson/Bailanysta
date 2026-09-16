import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function BackHomeButton() {
  const { t } = useI18n();
  const navigate = useNavigate();

  function handleClick() {
    // Go to wherever the user actually came from; only fall back to the feed
    // if this page was opened directly (no history to go back to, e.g. a
    // fresh tab or a shared link).
    if (window.history.length > 1) navigate(-1);
    else navigate("/home");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={t("common.back")}
      className="absolute left-0 flex items-center justify-center h-10 w-10 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
