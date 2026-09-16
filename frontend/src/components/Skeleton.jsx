export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-4 flex gap-3 animate-pulse">
      <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-3 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-2.5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export function NotificationSkeletonList({ count = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-2.5 w-1/5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export function RowSkeletonList({ count = 4 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  const widths = ["w-2/5", "w-1/3", "w-1/2", "w-1/4", "w-2/5"];
  return (
    <div className="space-y-2 animate-pulse">
      {widths.map((w, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className={`h-8 ${w} rounded-2xl bg-gray-200 dark:bg-gray-700`} />
        </div>
      ))}
    </div>
  );
}
