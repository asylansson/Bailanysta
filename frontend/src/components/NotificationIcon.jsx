function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" stroke="none">
      <path d="M12 20.5s-7-4.35-9.5-8.5C.7 8.7 2 5 5.5 5c2 0 3.5 1.2 4.5 2.8C11 6.2 12.5 5 14.5 5 18 5 19.3 8.7 17.5 12c-2.5 4.15-9.5 8.5-9.5 8.5" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14 4 9l5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h10a6 6 0 0 1 6 6v3" />
    </svg>
  );
}

function PersonPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="7.5" r="3.2" />
      <path strokeLinecap="round" d="M2.5 21c0-3.6 2.9-6.3 6.5-6.3s6.5 2.7 6.5 6.3" />
      <path strokeLinecap="round" d="M19 8v6M16 11h6" />
    </svg>
  );
}

function PendingBellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3a5 5 0 0 0-5 5v3.3c0 .9-.35 1.75-.97 2.38L5 15h14l-1.03-1.32A3.4 3.4 0 0 1 17 11.3V8a5 5 0 0 0-5-5Z"
      />
      <path strokeLinecap="round" d="M10 18a2 2 0 0 0 4 0" />
      <circle cx="18" cy="6" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.3 10.5 15 16 9" />
    </svg>
  );
}

const ICON_COMPONENTS = {
  like_post: HeartIcon,
  like_comment: HeartIcon,
  comment: CommentIcon,
  reply: ReplyIcon,
  follow: PersonPlusIcon,
  follow_request: PendingBellIcon,
  follow_accepted: CheckBadgeIcon,
  community_join_request: PendingBellIcon,
  community_join_accepted: CheckBadgeIcon,
};

export default function NotificationIcon({ type }) {
  const Icon = ICON_COMPONENTS[type] || CommentIcon;
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500 dark:bg-violet-950/50 dark:text-violet-400">
      <Icon />
    </span>
  );
}
