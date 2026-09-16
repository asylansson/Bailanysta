import { AVATAR_PRESETS, AvatarPresetIcon } from "../avatarPresets.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function AvatarPicker({ value, onChange }) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {AVATAR_PRESETS.map((preset) => {
        const name = t(`avatarNames.${preset.id}`);
        return (
          <button
            key={preset.id}
            type="button"
            title={name}
            onClick={() => onChange(preset.id)}
            className={`shrink-0 flex items-center justify-center h-12 w-12 rounded-full p-0.5 transition-all ${
              value === preset.id
                ? "ring-2 ring-violet-600 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                : "hover:opacity-80"
            }`}
          >
            <AvatarPresetIcon id={preset.id} label={name} className="block h-11 w-11 rounded-full" />
          </button>
        );
      })}
    </div>
  );
}
