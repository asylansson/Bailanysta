import { AVATAR_PRESETS, AvatarPresetIcon } from "../avatarPresets.jsx";

export default function Avatar({ name, picture, presetId, size = "md" }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const sizes = {
    sm: "h-8 w-8 text-sm",
    nav: "h-9 w-9 text-sm",
    md: "h-11 w-11 text-base",
    lg: "h-16 w-16 text-2xl",
  };

  const presetExists = presetId && AVATAR_PRESETS.some((p) => p.id === presetId);

  if (presetExists) {
    return <AvatarPresetIcon id={presetId} label={name} className={`${sizes[size]} shrink-0 rounded-full`} />;
  }

  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${sizes[size]} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} shrink-0 rounded-full bg-violet-600 text-white font-semibold flex items-center justify-center`}
    >
      {initial}
    </div>
  );
}
