// Flat cartoon-style icon avatars. Each preset is a self-contained <svg> with a
// viewBox of 0 0 64 64 so they can be dropped into any size circle uniformly.
//
// Gender presentation is signalled the same lightweight way across every preset:
// masculine = simple angled brows, feminine = lashes + soft blush, neutral = neither
// (no headwear/accessory involved, by design). Cat and dog each get a boy/girl pair;
// every other species is a single avatar, and which species reads masculine/feminine/
// neutral is deliberately mixed rather than following "tough animal = boy, cute
// animal = girl" stereotypes.

function Brows({ leftX, rightX, y }) {
  // Outer corners raised, inner corners lower - a friendly/confident tilt.
  // (The reverse - inner corners raised - reads as a worried/sad brow.)
  return (
    <>
      <path d={`M${leftX - 4} ${y - 3} L${leftX + 3} ${y - 1}`} stroke="#2A1A10" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d={`M${rightX - 3} ${y - 1} L${rightX + 4} ${y - 3}`} stroke="#2A1A10" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  );
}

// A gentle upward arch instead of a straight diagonal line - reads as relaxed/happy
// with no angry (outer-up/inner-down) or sad (inner-up/outer-down) connotation.
// Used only where a plain diagonal Brows still looked unhappy (wolf, rabbit, cat_boy).
function HappyBrows({ leftX, rightX, y }) {
  return (
    <>
      <path d={`M${leftX - 4} ${y} Q${leftX} ${y - 3.5} ${leftX + 4} ${y}`} stroke="#2A1A10" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d={`M${rightX - 4} ${y} Q${rightX} ${y - 3.5} ${rightX + 4} ${y}`} stroke="#2A1A10" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  );
}

function Lashes({ leftX, rightX, y }) {
  return (
    <>
      <path d={`M${leftX - 2} ${y - 3} L${leftX - 4} ${y - 6}`} stroke="#2A1A10" strokeWidth="1" strokeLinecap="round" />
      <path d={`M${leftX + 2} ${y - 3} L${leftX + 3} ${y - 6}`} stroke="#2A1A10" strokeWidth="1" strokeLinecap="round" />
      <path d={`M${rightX - 2} ${y - 3} L${rightX - 3} ${y - 6}`} stroke="#2A1A10" strokeWidth="1" strokeLinecap="round" />
      <path d={`M${rightX + 2} ${y - 3} L${rightX + 4} ${y - 6}`} stroke="#2A1A10" strokeWidth="1" strokeLinecap="round" />
    </>
  );
}

function Blush({ leftX, rightX, y }) {
  return (
    <>
      <ellipse cx={leftX} cy={y} rx="3" ry="2" fill="#F4A7C0" opacity="0.6" />
      <ellipse cx={rightX} cy={y} rx="3" ry="2" fill="#F4A7C0" opacity="0.6" />
    </>
  );
}

const PRESETS = [
  {
    id: "lion",
    label: "Лев",
    bg: "#F4A93A",
    render: () => (
      <>
        <circle cx="32" cy="32" r="22" fill="#D9821A" />
        <circle cx="32" cy="32" r="16" fill="#F4A93A" />
        <ellipse cx="32" cy="38" rx="8" ry="6" fill="#FCE3B0" />
        <circle cx="24" cy="28" r="2.4" fill="#3A2313" />
        <circle cx="40" cy="28" r="2.4" fill="#3A2313" />
        <path d="M28 40 q4 3 8 0" stroke="#3A2313" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <Lashes leftX={24} rightX={40} y={26} />
        <Blush leftX={20} rightX={44} y={33} />
      </>
    ),
  },
  {
    id: "wolf",
    label: "Волк",
    bg: "#8B98A5",
    render: () => (
      <>
        <path d="M14 20 L24 8 L28 22 Z" fill="#6B7885" />
        <path d="M50 20 L40 8 L36 22 Z" fill="#6B7885" />
        <circle cx="32" cy="34" r="18" fill="#8B98A5" />
        <path d="M22 40 Q32 50 42 40 Q32 44 22 40 Z" fill="#F2F4F6" />
        <circle cx="26" cy="30" r="2.2" fill="#22262B" />
        <circle cx="38" cy="30" r="2.2" fill="#22262B" />
        <ellipse cx="32" cy="40" rx="2.4" ry="1.8" fill="#22262B" />
        <path d="M25 45 Q32 51 39 45" stroke="#22262B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <HappyBrows leftX={26} rightX={38} y={26} />
      </>
    ),
  },
  {
    id: "rhino",
    label: "Носорог",
    bg: "#A9ACA3",
    render: () => (
      <>
        <circle cx="32" cy="34" r="19" fill="#9CA097" />
        <path d="M9 30 L23 26 L23 34 Z" fill="#9CA097" />
        <path d="M55 30 L41 26 L41 34 Z" fill="#9CA097" />
        <path d="M28 24 L34 24 L31 12 Z" fill="#D8D8CE" />
        <ellipse cx="32" cy="42" rx="10" ry="7" fill="#BCC0B6" />
        <circle cx="26" cy="34" r="2" fill="#22221E" />
        <circle cx="38" cy="34" r="2" fill="#22221E" />
        <path d="M27 45 Q32 48 37 45" stroke="#6B6B5F" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "bear",
    label: "Медведь",
    bg: "#A9744F",
    render: () => (
      <>
        <circle cx="16" cy="18" r="7" fill="#8F5F3E" />
        <circle cx="48" cy="18" r="7" fill="#8F5F3E" />
        <circle cx="32" cy="34" r="19" fill="#A9744F" />
        <ellipse cx="32" cy="40" rx="9" ry="7" fill="#D8B490" />
        <circle cx="32" cy="40" r="2" fill="#33220F" />
        <circle cx="25" cy="29" r="2.2" fill="#241708" />
        <circle cx="39" cy="29" r="2.2" fill="#241708" />
        <path d="M27 43 Q32 46 37 43" stroke="#33220F" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <Lashes leftX={25} rightX={39} y={27} />
        <Blush leftX={21} rightX={43} y={35} />
      </>
    ),
  },
  {
    id: "raccoon",
    label: "Енот",
    bg: "#9A9184",
    render: () => (
      <>
        <circle cx="16" cy="18" r="7" fill="#6E675D" />
        <circle cx="48" cy="18" r="7" fill="#6E675D" />
        <circle cx="32" cy="34" r="18" fill="#A6A091" />
        <ellipse cx="24" cy="30" rx="6.5" ry="5.5" fill="#3A362F" />
        <ellipse cx="40" cy="30" rx="6.5" ry="5.5" fill="#3A362F" />
        <circle cx="24" cy="30" r="2.1" fill="#F5F3EC" />
        <circle cx="40" cy="30" r="2.1" fill="#F5F3EC" />
        <ellipse cx="32" cy="41" rx="5" ry="4" fill="#DCD8CC" />
        <ellipse cx="32" cy="40" rx="1.6" ry="1.3" fill="#241F19" />
        <path d="M27 44 Q32 47 37 44" stroke="#3A362F" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <Brows leftX={24} rightX={40} y={22} />
      </>
    ),
  },
  {
    id: "fox",
    label: "Лиса",
    bg: "#E8722C",
    render: () => (
      <>
        <path d="M14 14 L26 24 L18 30 Z" fill="#E8722C" />
        <path d="M50 14 L38 24 L46 30 Z" fill="#E8722C" />
        <path d="M18 16 L24 22 L20 26 Z" fill="#FBEAD7" />
        <path d="M46 16 L40 22 L44 26 Z" fill="#FBEAD7" />
        <circle cx="32" cy="34" r="18" fill="#E8722C" />
        <path d="M32 36 L24 44 Q32 50 40 44 Z" fill="#FBEAD7" />
        <circle cx="26" cy="30" r="2.2" fill="#2B1608" />
        <circle cx="38" cy="30" r="2.2" fill="#2B1608" />
        <circle cx="32" cy="38" r="1.8" fill="#2B1608" />
        <path d="M28 44 Q32 47 36 44" stroke="#2B1608" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Lashes leftX={26} rightX={38} y={28} />
        <Blush leftX={22} rightX={42} y={33} />
      </>
    ),
  },
  {
    id: "pig",
    label: "Свинка",
    bg: "#F4B6C2",
    render: () => (
      <>
        <circle cx="18" cy="22" r="6" fill="#F0A0B2" />
        <circle cx="46" cy="22" r="6" fill="#F0A0B2" />
        <circle cx="32" cy="34" r="19" fill="#F7C6D2" />
        <ellipse cx="32" cy="40" rx="8" ry="6" fill="#E88CA0" />
        <circle cx="28" cy="40" r="1.4" fill="#7A2F3F" />
        <circle cx="36" cy="40" r="1.4" fill="#7A2F3F" />
        <circle cx="25" cy="30" r="2" fill="#5A2233" />
        <circle cx="39" cy="30" r="2" fill="#5A2233" />
        <path d="M27 36 Q32 39 37 36" stroke="#5A2233" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Lashes leftX={25} rightX={39} y={28} />
        <Blush leftX={22} rightX={42} y={35} />
      </>
    ),
  },
  {
    id: "cow",
    label: "Корова",
    bg: "#F7F3EC",
    render: () => (
      <>
        <circle cx="32" cy="34" r="19" fill="#FBF8F2" />
        <path d="M20 18 Q24 8 30 16 Z" fill="#3B332A" />
        <path d="M44 18 Q40 8 34 16 Z" fill="#3B332A" />
        <path d="M18 26 Q22 20 26 26 Q22 30 18 26 Z" fill="#3B332A" />
        <path d="M46 40 Q42 34 38 40 Q42 44 46 40 Z" fill="#3B332A" />
        <ellipse cx="32" cy="42" rx="9" ry="6" fill="#F4A7C0" />
        <circle cx="28" cy="42" r="1.3" fill="#7A3550" />
        <circle cx="36" cy="42" r="1.3" fill="#7A3550" />
        <circle cx="25" cy="30" r="2" fill="#241F19" />
        <circle cx="39" cy="30" r="2" fill="#241F19" />
        <path d="M28 44 Q32 47 36 44" stroke="#7A3550" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Brows leftX={25} rightX={39} y={28} />
      </>
    ),
  },
  {
    id: "panda",
    label: "Панда",
    bg: "#F5F5F0",
    render: () => (
      <>
        <circle cx="15" cy="18" r="7" fill="#25211C" />
        <circle cx="49" cy="18" r="7" fill="#25211C" />
        <circle cx="32" cy="34" r="18" fill="#FAFAF6" />
        <ellipse cx="24" cy="30" rx="5" ry="6" fill="#25211C" />
        <ellipse cx="40" cy="30" rx="5" ry="6" fill="#25211C" />
        <circle cx="24" cy="31" r="1.6" fill="#FAFAF6" />
        <circle cx="40" cy="31" r="1.6" fill="#FAFAF6" />
        <ellipse cx="32" cy="42" rx="2" ry="1.6" fill="#25211C" />
        <path d="M28 44 Q32 47 36 44" stroke="#25211C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Lashes leftX={24} rightX={40} y={25} />
        <Blush leftX={22} rightX={42} y={37} />
      </>
    ),
  },
  {
    id: "rabbit",
    label: "Кролик",
    bg: "#EDEAE3",
    render: () => (
      <>
        <path d="M22 24 Q18 4 26 6 Q28 16 28 24 Z" fill="#EDEAE3" />
        <path d="M42 24 Q46 4 38 6 Q36 16 36 24 Z" fill="#EDEAE3" />
        <path d="M23 22 Q21 8 25 9 Q26 16 26 22 Z" fill="#F3B9C6" />
        <path d="M41 22 Q43 8 39 9 Q38 16 38 22 Z" fill="#F3B9C6" />
        <circle cx="32" cy="36" r="17" fill="#F5F3EE" />
        <ellipse cx="32" cy="42" rx="6" ry="4" fill="#F3B9C6" />
        <circle cx="26" cy="32" r="2" fill="#3A322A" />
        <circle cx="38" cy="32" r="2" fill="#3A322A" />
        <path d="M26 48 Q32 53 38 48" stroke="#3A322A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <HappyBrows leftX={26} rightX={38} y={28} />
      </>
    ),
  },
  {
    id: "penguin",
    label: "Пингвин",
    bg: "#DCE7EE",
    render: () => (
      <>
        <ellipse cx="32" cy="34" rx="17" ry="20" fill="#26333D" />
        <ellipse cx="32" cy="38" rx="10" ry="14" fill="#F3F6F8" />
        <path d="M32 36 L38 42 L32 44 Z" fill="#F2B33D" />
        <circle cx="27" cy="26" r="2" fill="#F3F6F8" />
        <circle cx="37" cy="26" r="2" fill="#F3F6F8" />
        <circle cx="27" cy="26" r="1" fill="#1B242B" />
        <circle cx="37" cy="26" r="1" fill="#1B242B" />
      </>
    ),
  },
  {
    id: "koala",
    label: "Коала",
    bg: "#B7B9BB",
    render: () => (
      <>
        <circle cx="14" cy="26" r="9" fill="#9EA1A3" />
        <circle cx="50" cy="26" r="9" fill="#9EA1A3" />
        <circle cx="32" cy="34" r="17" fill="#C7C9CB" />
        <ellipse cx="32" cy="40" rx="7" ry="5" fill="#5B5D5E" />
        <circle cx="25" cy="30" r="2.1" fill="#242526" />
        <circle cx="39" cy="30" r="2.1" fill="#242526" />
        <path d="M27 47 Q32 50 37 47" stroke="#242526" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "owl",
    label: "Сова",
    bg: "#8A6B4E",
    render: () => (
      <>
        <path d="M20 14 L26 22 L16 24 Z" fill="#6E5238" />
        <path d="M44 14 L38 22 L48 24 Z" fill="#6E5238" />
        <circle cx="32" cy="34" r="19" fill="#8A6B4E" />
        <circle cx="24" cy="32" r="7" fill="#F3ECD9" />
        <circle cx="40" cy="32" r="7" fill="#F3ECD9" />
        <circle cx="24" cy="32" r="3" fill="#241A0E" />
        <circle cx="40" cy="32" r="3" fill="#241A0E" />
        <path d="M32 38 L28 44 L36 44 Z" fill="#EFA23A" />
        <Brows leftX={24} rightX={40} y={24} />
      </>
    ),
  },
  {
    id: "monkey",
    label: "Обезьяна",
    bg: "#8D6748",
    render: () => (
      <>
        <circle cx="14" cy="30" r="8" fill="#7A5638" />
        <circle cx="50" cy="30" r="8" fill="#7A5638" />
        <circle cx="14" cy="30" r="4.5" fill="#D9BE99" />
        <circle cx="50" cy="30" r="4.5" fill="#D9BE99" />
        <circle cx="32" cy="34" r="18" fill="#8D6748" />
        <ellipse cx="32" cy="40" rx="10" ry="8" fill="#D9BE99" />
        <circle cx="27" cy="30" r="2.1" fill="#20140A" />
        <circle cx="37" cy="30" r="2.1" fill="#20140A" />
        <path d="M27 42 Q32 45 37 42" stroke="#5A3E24" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "cat_boy",
    label: "Кот",
    bg: "#D9A066",
    render: () => (
      <>
        <path d="M16 14 L26 24 L18 26 Z" fill="#D9A066" />
        <path d="M48 14 L38 24 L46 26 Z" fill="#D9A066" />
        <circle cx="32" cy="34" r="18" fill="#E3AF77" />
        <path d="M18 38 L10 36 M18 40 L10 40 M46 38 L54 36 M46 40 L54 40" stroke="#4A2F14" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M27 43 Q32 49 37 43" stroke="#4A2F14" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M32 38 L30 40 L34 40 Z" fill="#4A2F14" />
        <circle cx="25" cy="30" r="2.2" fill="#241505" />
        <circle cx="39" cy="30" r="2.2" fill="#241505" />
        <HappyBrows leftX={25} rightX={39} y={26} />
        <path d="M26 46 L38 46 L32 52 Z" fill="#4A7FBE" />
      </>
    ),
  },
  {
    id: "cat_girl",
    label: "Кошка",
    bg: "#F6D9EA",
    render: () => (
      <>
        <path d="M16 14 L26 24 L18 26 Z" fill="#F0BFD8" />
        <path d="M48 14 L38 24 L46 26 Z" fill="#F0BFD8" />
        <circle cx="32" cy="34" r="18" fill="#FCEAF3" />
        <path d="M18 38 L10 36 M18 40 L10 40 M46 38 L54 36 M46 40 L54 40" stroke="#7A4A63" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M27 43 Q32 49 37 43" stroke="#7A4A63" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M32 38 L30 40 L34 40 Z" fill="#E8A0C0" />
        <circle cx="25" cy="30" r="2.2" fill="#3A1E2C" />
        <circle cx="39" cy="30" r="2.2" fill="#3A1E2C" />
        <Lashes leftX={25} rightX={39} y={28} />
        <Blush leftX={22} rightX={42} y={34} />
      </>
    ),
  },
  {
    id: "dog_boy",
    label: "Пёс",
    bg: "#C79358",
    render: () => (
      <>
        <path d="M14 20 Q10 34 20 38 Q18 26 22 20 Z" fill="#9C6A34" />
        <path d="M50 20 Q54 34 44 38 Q46 26 42 20 Z" fill="#9C6A34" />
        <circle cx="32" cy="34" r="18" fill="#C79358" />
        <ellipse cx="32" cy="40" rx="8" ry="6" fill="#EBD3AC" />
        <ellipse cx="32" cy="38" rx="2.6" ry="2" fill="#2B1B0B" />
        <circle cx="25" cy="29" r="2.1" fill="#2B1B0B" />
        <circle cx="39" cy="29" r="2.1" fill="#2B1B0B" />
        <path d="M27 42 Q32 45 37 42" stroke="#2B1B0B" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <Brows leftX={25} rightX={39} y={27} />
        <path d="M26 46 L38 46 L32 52 Z" fill="#C0392B" />
      </>
    ),
  },
  {
    id: "dog_girl",
    label: "Собачка",
    bg: "#FBE0D9",
    render: () => (
      <>
        <path d="M14 20 Q10 34 20 38 Q18 26 22 20 Z" fill="#F0B8A8" />
        <path d="M50 20 Q54 34 44 38 Q46 26 42 20 Z" fill="#F0B8A8" />
        <circle cx="32" cy="34" r="18" fill="#FDEDE7" />
        <ellipse cx="32" cy="40" rx="8" ry="6" fill="#FBD9CE" />
        <ellipse cx="32" cy="38" rx="2.6" ry="2" fill="#3A2418" />
        <circle cx="25" cy="29" r="2.1" fill="#3A2418" />
        <circle cx="39" cy="29" r="2.1" fill="#3A2418" />
        <path d="M27 42 Q32 45 37 42" stroke="#3A2418" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <Lashes leftX={25} rightX={39} y={27} />
        <Blush leftX={22} rightX={42} y={36} />
      </>
    ),
  },
];

export const AVATAR_PRESETS = PRESETS;

export function AvatarPresetIcon({ id, className, label }) {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return null;
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={label || preset.label}>
      <circle cx="32" cy="32" r="32" fill={preset.bg} />
      {preset.render()}
    </svg>
  );
}
