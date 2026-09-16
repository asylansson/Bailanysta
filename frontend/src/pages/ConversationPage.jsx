import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchConversationStatus,
  fetchConversationMessages,
  sendMessageTo,
  markConversationRead,
  toggleFollow,
} from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import Avatar from "../components/Avatar.jsx";
import FollowButton from "../components/FollowButton.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";
import { ChatSkeleton } from "../components/Skeleton.jsx";
import { formatTime } from "../formatDate.js";

export default function ConversationPage({ currentUser }) {
  const { userId } = useParams();
  const { t, language } = useI18n();
  const [status, setStatus] = useState("loading");
  const [otherUser, setOtherUser] = useState(null);
  const [isMutualFriend, setIsMutualFriend] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    setStatus("loading");

    fetchConversationStatus(userId)
      .then(async (statusData) => {
        if (cancelled) return;
        setOtherUser(statusData.otherUser);
        setIsMutualFriend(statusData.isMutualFriend);

        if (statusData.isMutualFriend) {
          const msgs = await fetchConversationMessages(userId);
          if (!cancelled) setMessages(msgs);
          markConversationRead(userId).catch(() => {});
        }
        if (!cancelled) setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [userId, currentUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const message = await sendMessageTo(userId, trimmed);
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  async function handleFollowToggle() {
    setFollowBusy(true);
    try {
      await toggleFollow(userId);
      const statusData = await fetchConversationStatus(userId);
      setOtherUser(statusData.otherUser);
      setIsMutualFriend(statusData.isMutualFriend);
      if (statusData.isMutualFriend) {
        const msgs = await fetchConversationMessages(userId);
        setMessages(msgs);
      }
    } finally {
      setFollowBusy(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-gray-500 dark:text-gray-400">{t("profileGate.subtitle")}</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-3 mb-4 pl-12 animate-pulse">
          <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <ChatSkeleton />
      </div>
    );
  }

  if (status === "error" || !otherUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-red-500">{t("messages.loadError")}</p>
        <Link to="/messages" className="text-violet-600 dark:text-violet-400 hover:underline">
          {t("messages.backToInbox")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="relative flex items-center gap-3 mb-4 pl-12">
        <BackHomeButton />
        <Link to={`/u/${otherUser.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar name={otherUser.name} picture={otherUser.picture} presetId={otherUser.avatarPreset} />
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{otherUser.name}</h1>
        </Link>
      </div>

      {!isMutualFriend ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t("messages.followPrompt")}</p>
          <div className="flex items-center justify-center gap-3">
            <FollowButton
              isFollowing={otherUser.isFollowing}
              followRequestPending={otherUser.followRequestPending}
              isPrivate={otherUser.isPrivate}
              onToggle={handleFollowToggle}
              disabled={followBusy}
            />
            <Link
              to="/messages"
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {t("common.back")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-2 overflow-y-auto pb-3">
            {messages.map((m) => {
              const mine = m.senderId === currentUser.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <span className={`block mt-1 text-[10px] ${mine ? "text-violet-200" : "text-gray-400"}`}>
                      {formatTime(m.createdAt, language)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-violet-400 dark:border-violet-900">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("messages.typePlaceholder")}
              maxLength={2000}
              className="flex-1 rounded-lg border border-violet-400 dark:border-violet-900 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("common.send")}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
