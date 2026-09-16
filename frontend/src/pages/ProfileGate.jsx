import { useState } from "react";
import { Navigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { signInWithGoogle } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function ProfileGate({ user, onLogin }) {
  const { t } = useI18n();
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to={user.onboarded ? `/u/${user.handle}` : "/onboarding"} replace />;
  }

  async function handleSuccess(credentialResponse) {
    setError("");
    try {
      const { token, user: loggedInUser } = await signInWithGoogle(credentialResponse.credential);
      onLogin(token, loggedInUser);
    } catch (err) {
      setError(err.message || t("profileGate.error"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-violet-400 dark:border-violet-900 shadow-sm p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("profileGate.title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("profileGate.subtitle")}</p>
        <div className="mt-5 flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError(t("profileGate.error"))}
            theme="filled_blue"
            shape="pill"
            text="signin_with"
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
