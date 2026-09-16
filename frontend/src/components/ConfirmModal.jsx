import { useI18n } from "../i18n/I18nContext.jsx";

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/40 modal-overlay-enter" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-violet-400 dark:border-violet-900 modal-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-400 dark:border-violet-900">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
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

        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
            >
              {cancelLabel || t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-colors ${
                danger ? "bg-red-600 hover:bg-red-700" : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
