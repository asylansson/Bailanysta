import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import TopProgressBar from "./components/TopProgressBar.jsx";
import Feed from "./pages/Feed.jsx";
import ProfileGate from "./pages/ProfileGate.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useTheme } from "./hooks/useTheme.js";
import { useLanguage } from "./hooks/useLanguage.js";
import { setAuthToken, fetchMySettings } from "./api.js";
import { I18nProvider } from "./i18n/I18nContext.jsx";
import { PostSkeletonList } from "./components/Skeleton.jsx";

// Feed and ProfileGate are the near-universal landing pages, loaded eagerly
// above; everything else is fetched only when actually navigated to, keeping
// the first paint's JS payload small.
const OnboardingPage = lazy(() => import("./pages/OnboardingPage.jsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.jsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.jsx"));
const MessagesPage = lazy(() => import("./pages/MessagesPage.jsx"));
const ConversationPage = lazy(() => import("./pages/ConversationPage.jsx"));
const CommunitiesPage = lazy(() => import("./pages/CommunitiesPage.jsx"));
const CommunityDetail = lazy(() => import("./pages/CommunityDetail.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));

export default function App() {
  const { token, user, login, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const syncedUserId = useRef(null);

  // useLayoutEffect (not useEffect) so the token is attached before any child's
  // own useEffect fires its first fetch - React runs all layout effects in a
  // commit before any passive effects, regardless of tree position. With a plain
  // useEffect here, a child's data-fetching effect can win the race on first
  // mount and go out unauthenticated, causing a transient 401.
  useLayoutEffect(() => {
    setAuthToken(token);
  }, [token]);

  // A stored session can outlive the account it points to (deleted user,
  // wiped/reset dev database, etc.) - the token itself still looks valid, so
  // the app would otherwise show a "signed in" shell for an account that no
  // longer exists anywhere, with no way back to the sign-in button. Validate
  // the session against the server once and sign out locally if it's stale.
  // This also re-syncs the cached user object, so a session stored before a
  // field like `handle` existed picks it up without a fresh login.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchMySettings()
      .then((settings) => {
        if (!cancelled) updateUser(settings);
      })
      .catch(() => {
        if (!cancelled) logout();
      });
    return () => {
      cancelled = true;
    };
  }, [token, logout, updateUser]);

  // Once per signed-in account, switch the UI to that account's saved language
  // preference (it should win over whatever a guest previously set on this browser).
  useEffect(() => {
    if (user && user.id !== syncedUserId.current) {
      syncedUserId.current = user.id;
      if (user.language) setLanguage(user.language);
    }
    if (!user) syncedUserId.current = null;
  }, [user, setLanguage]);

  function requireUser() {
    if (!user) {
      navigate("/profile");
      return false;
    }
    return true;
  }

  return (
    <I18nProvider language={language} setLanguage={setLanguage}>
      <div className="min-h-screen bg-violet-50 dark:bg-gray-900">
        <TopProgressBar />
        <Navbar currentUser={user} theme={theme} onToggleTheme={toggleTheme} onLogout={logout} />
        <Suspense
          fallback={
            <div className="mx-auto max-w-2xl px-4 py-6">
              <PostSkeletonList count={1} />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Feed currentUser={user} requireUser={requireUser} />} />
            <Route path="/profile" element={<ProfileGate user={user} onLogin={login} />} />
            <Route path="/onboarding" element={<OnboardingPage currentUser={user} onUserUpdate={updateUser} />} />
            <Route
              path="/u/:id"
              element={
                <UserProfile
                  currentUser={user}
                  requireUser={requireUser}
                  onLogout={logout}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                />
              }
            />
            <Route path="/posts/:id" element={<PostDetail currentUser={user} requireUser={requireUser} />} />
            <Route path="/notifications" element={<NotificationsPage currentUser={user} />} />
            <Route path="/messages" element={<MessagesPage currentUser={user} />} />
            <Route path="/messages/:userId" element={<ConversationPage currentUser={user} />} />
            <Route path="/communities" element={<CommunitiesPage currentUser={user} requireUser={requireUser} />} />
            <Route
              path="/communities/:id"
              element={<CommunityDetail currentUser={user} requireUser={requireUser} />}
            />
            <Route path="/search" element={<SearchPage currentUser={user} />} />
            <Route path="/settings" element={<SettingsPage currentUser={user} onUserUpdate={updateUser} />} />
          </Routes>
        </Suspense>
      </div>
    </I18nProvider>
  );
}
