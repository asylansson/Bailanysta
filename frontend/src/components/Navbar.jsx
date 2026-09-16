import { NavLink } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

const primaryBase =
  "group relative flex h-11 min-w-[2.75rem] sm:h-12 sm:min-w-[4rem] shrink-0 items-center justify-center overflow-hidden rounded-xl px-2 sm:px-3 transition-colors duration-300";
const primaryActive = "bg-violet-600 text-white shadow-sm";
const primaryInactive =
  "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50";

const labelClass =
  "ml-0 max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-[10rem] group-hover:opacity-100";

const iconBase =
  "flex items-center justify-center h-11 w-11 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";
const iconActive = "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100";

function FeedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11.5 12 4l8 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v9h5v-5h2v5h5v-9" />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" />
    </svg>
  );
}

function GoogleGIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 shrink-0">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9.1h11.9c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.5-9.5 6.5-16.7Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C8 41.6 15.4 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.6 28.2c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3A21.9 21.9 0 0 0 2 24c0 3.6.9 6.9 2.3 9.9l7.3-5.7Z"
      />
      <path
        fill="#EA4335"
        d="M24 10.7c3.2 0 6.1 1.1 8.3 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.4 2 8 6.4 4.3 14.1l7.3 5.7c1.8-5.2 6.6-9.1 12.4-9.1Z"
      />
    </svg>
  );
}

function CommunitiesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8.5" r="3" />
      <circle cx="17" cy="9.5" r="2.3" />
      <path strokeLinecap="round" d="M3 20c0-3.1 2.6-5.3 6-5.3s6 2.2 6 5.3" />
      <path strokeLinecap="round" d="M14.5 15c2.7.3 4.5 2 4.5 4.6" />
    </svg>
  );
}

const WORDMARK = "Bailanysta";

const NETWORK_NODES = [
  { left: "6%", top: "22%", size: "6px", duration: "7s", delay: "0s", dx: "34px", dy: "-16px", color: "rgba(139,92,246,0.85)" },
  { left: "18%", top: "72%", size: "4px", duration: "9s", delay: "1.4s", dx: "-22px", dy: "-24px", color: "rgba(217,70,239,0.8)" },
  { left: "38%", top: "12%", size: "5px", duration: "8s", delay: "0.6s", dx: "18px", dy: "26px", color: "rgba(96,165,250,0.8)" },
  { left: "55%", top: "78%", size: "5px", duration: "10s", delay: "2.1s", dx: "-26px", dy: "18px", color: "rgba(139,92,246,0.75)" },
  { left: "72%", top: "18%", size: "6px", duration: "7.5s", delay: "1s", dx: "24px", dy: "-20px", color: "rgba(217,70,239,0.75)" },
  { left: "86%", top: "62%", size: "4px", duration: "9.5s", delay: "2.6s", dx: "-18px", dy: "16px", color: "rgba(96,165,250,0.75)" },
  { left: "94%", top: "30%", size: "5px", duration: "8.5s", delay: "3.2s", dx: "20px", dy: "22px", color: "rgba(139,92,246,0.7)" },
];

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "kk", label: "KZ" },
  { code: "ru", label: "RU" },
];

export default function Navbar({ currentUser }) {
  const { t, language, setLanguage } = useI18n();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-800/90">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <span
            className="aurora-blob aurora-blob-1 -left-8 -top-10 h-40 w-40 opacity-40 dark:opacity-60"
            style={{ background: "radial-gradient(circle, rgba(167,139,250,0.9), transparent 70%)" }}
          />
          <span
            className="aurora-blob aurora-blob-2 -right-6 top-0 h-44 w-44 opacity-40 dark:opacity-55"
            style={{ background: "radial-gradient(circle, rgba(232,121,249,0.85), transparent 70%)" }}
          />
          <span
            className="aurora-blob aurora-blob-3 left-1/2 bottom-0 h-36 w-36 opacity-35 dark:opacity-50"
            style={{ background: "radial-gradient(circle, rgba(96,165,250,0.8), transparent 70%)" }}
          />
          {NETWORK_NODES.map((n, i) => (
            <span
              key={i}
              className="network-node"
              style={{
                left: n.left,
                top: n.top,
                width: n.size,
                height: n.size,
                backgroundColor: n.color,
                animationDuration: n.duration,
                animationDelay: n.delay,
                "--drift-x": n.dx,
                "--drift-y": n.dy,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex h-16 max-w-2xl items-center justify-center px-4 pt-3 pb-1">
          <div className="flex w-1/3 min-w-fit items-center justify-between">
            {WORDMARK.split("").map((ch, i) => (
              <span key={i} className="brand-wordmark text-2xl font-extrabold text-violet-700 dark:text-violet-300">
                {ch}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex h-14 max-w-2xl items-center justify-between gap-1 px-3 py-2.5 sm:px-4">
          <div className="flex shrink-0 items-center gap-0.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                title={l.label}
                className={`px-1.5 py-1 rounded-md text-[11px] font-bold tracking-wide transition-colors ${
                  language === l.code
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-gray-400 dark:text-gray-500 hover:text-violet-500 dark:hover:text-violet-400"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2">
            <NavLink
              to="/home"
              end
              title={t("nav.feed")}
              className={({ isActive }) => `${primaryBase} ${isActive ? primaryActive : primaryInactive}`}
            >
              <FeedIcon />
              <span className={labelClass}>{t("nav.homeLabel")}</span>
            </NavLink>
            {currentUser && (
              <NavLink
                to="/messages"
                title={t("nav.messages")}
                className={({ isActive }) => `${primaryBase} ${isActive ? primaryActive : primaryInactive}`}
              >
                <MessagesIcon />
                <span className={labelClass}>{t("nav.messages")}</span>
              </NavLink>
            )}
            <NavLink
              to="/communities"
              title={t("nav.communities")}
              className={({ isActive }) => `${primaryBase} ${isActive ? primaryActive : primaryInactive}`}
            >
              <CommunitiesIcon />
              <span className={labelClass}>{t("nav.communities")}</span>
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            {currentUser ? (
              <NavLink
                to="/profile"
                className={({ isActive }) => `${iconBase} ${isActive ? iconActive : ""}`}
                title={t("nav.profile")}
              >
                <Avatar name={currentUser.name} picture={currentUser.picture} presetId={currentUser.avatarPreset} size="nav" />
              </NavLink>
            ) : (
              <NavLink
                to="/profile"
                title={t("nav.googleSignIn")}
                className="flex items-center gap-1.5 h-10 pl-2.5 pr-3 rounded-full border border-violet-300 dark:border-violet-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors"
              >
                <GoogleGIcon />
                <span className="whitespace-nowrap">{t("nav.googleSignIn")}</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
