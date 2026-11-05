import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  clearSession,
  get_token,
  getProfile,
  saveSession,
} from "../services/authService";
import { AUTH_EXPIRED_EVENT } from "../services/apiClient";
import { useNotify } from "./NotifyContext";

/* Single source of truth for the signed-in user.
   Replaces the separate getProfile calls that App, TopHeader,
   SupportPage and Profile each made on their own. */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();
  const notify = useNotify();

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const loadUser = useCallback(async () => {
    const token = await get_token();
    if (!token) {
      setUser(null);
      return null;
    }
    const res = await getProfile(token);
    if (res.success) {
      setUser(res.user);
      return res.user;
    }
    // Network errors keep the session; auth errors clear it
    if (res.status === 401 || res.status === 403) {
      clearSession();
      setUser(null);
    }
    return null;
  }, []);

  // Restore session once on start
  useEffect(() => {
    loadUser().finally(() => setReady(true));
  }, [loadUser]);

  const signIn = useCallback(
    async (token) => {
      saveSession(token);
      return loadUser();
    },
    [loadUser],
  );

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Any 401 from the API signs the user out with a clear message
  useEffect(() => {
    const onExpired = () => {
      if (!localStorage.getItem("Token")) return;
      clearSession();
      setUser(null);
      notify(t("common.session_expired"), "warning");
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [notify, t]);

  const value = useMemo(
    () => ({
      user,
      ready,
      isSignedIn: !!user,
      isAdmin: user?.role === "admin",
      signIn,
      signOut,
      refreshUser: loadUser,
    }),
    [user, ready, signIn, signOut, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
