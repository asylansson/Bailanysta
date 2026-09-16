export default function LikeButton({ liked, count, onToggle, size = "md" }) {
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 ${textSize} font-medium transition-colors ${
        liked
          ? "text-violet-600 dark:text-violet-400"
          : "text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.5s-7-4.35-9.5-8.5C.7 8.7 2 5 5.5 5c2 0 3.5 1.2 4.5 2.8C11 6.2 12.5 5 14.5 5 18 5 19.3 8.7 17.5 12c-2.5 4.15-9.5 8.5-9.5 8.5"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
