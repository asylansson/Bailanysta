const SPLIT_RE = /(#[\p{L}\d_]+)/gu;
const MATCH_RE = /^#[\p{L}\d_]+$/u;

export default function HashtagText({ text }) {
  const parts = text.split(SPLIT_RE);

  return (
    <>
      {parts.map((part, i) =>
        MATCH_RE.test(part) ? (
          <span key={i} className="text-violet-600 dark:text-violet-400 font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
