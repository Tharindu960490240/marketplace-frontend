import React from "react";
import { useTranslation } from "react-i18next";
import { usePreferences } from "../../context/PreferencesContext";

import "../styles/auth.css";

/* Two-panel frame for sign in / sign up / password screens. */
const AuthLayout = ({ title, subtitle, children, wide = false }) => {
  const { t } = useTranslation();
  const { mode } = usePreferences();

  return (
    <div className="auth-page">
      <div className={`auth-card ${wide ? "wide" : ""}`}>
        <aside className="auth-brand">
          <img
            src={mode === "dark" ? "/assets/logoD.png" : "/assets/logo.png"}
            alt="Agri Link Services"
            className="auth-brand-logo"
          />
          <h2>{t("auth.brand_title")}</h2>
          <p>{t("auth.brand_text")}</p>
        </aside>

        <main className="auth-form">
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
