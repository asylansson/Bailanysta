import { useEffect, useLayoutEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import TopProgressBar from "./components/TopProgressBar.jsx";
import Feed from "./pages/Feed.jsx";
import ProfileGate from "./pages/ProfileGate.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import ConversationPage from "./pages/ConversationPage.jsx";
import CommunitiesPage from "./pages/CommunitiesPage.jsx";
import CommunityDetail from "./pages/CommunityDetail.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useTheme } from "./hooks/useTheme.js";
import { useLanguage } from "./hooks/useLanguage.js";
import { setAuthToken, fetchMySettings } from "./api.js";
import { I18nProvider } from "./i18n/I18nContext.jsx";

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
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchMySettings().catch(() => {
      if (!cancelled) logout();
    });
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

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
        <Navbar currentUser={user} />
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
      </div>
    </I18nProvider>
  );
}
