import { TOPIC_IDS } from "../topics.js";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function TopicsPicker({ value, onChange }) {
  const { t } = useI18n();

  function toggle(id) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TOPIC_IDS.map((id) => {
        const selected = value.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected
                ? "bg-violet-600 text-white"
                : "border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950"
            }`}
          >
            {t(`topics.${id}`)}
          </button>
        );
      })}
    </div>
  );
}
