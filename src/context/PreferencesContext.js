import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useTranslation } from "react-i18next";
import { buildTheme } from "../theme";

const PreferencesContext = createContext(null);

const read = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
};

export const PreferencesProvider = ({ children }) => {
  const { i18n } = useTranslation();

  // Default to the light theme on first load; a returning visitor keeps
  // whatever they last chose (persisted under pref_theme).
  const [mode, setMode] = useState(() => read("pref_theme", "light"));
  const [language, setLanguage] = useState(() => read("pref_lang", "en"));

  // Theme → <html data-theme>, persisted
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    write("pref_theme", mode);
  }, [mode]);

  // Language → i18n, <html lang>, body class for fonts, persisted
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.setAttribute("lang", language);
    document.body.classList.remove("lang-en", "lang-si");
    document.body.classList.add(`lang-${language}`);
    write("pref_lang", language);
  }, [language, i18n]);

  const toggleMode = useCallback(
    () => setMode((m) => (m === "dark" ? "light" : "dark")),
    [],
  );
  const toggleLanguage = useCallback(
    () => setLanguage((l) => (l === "en" ? "si" : "en")),
    [],
  );

  const theme = useMemo(() => buildTheme(mode, language), [mode, language]);

  const value = useMemo(
    () => ({ mode, language, toggleMode, toggleLanguage }),
    [mode, language, toggleMode, toggleLanguage],
  );

  return (
    <PreferencesContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
