import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, InputAdornment, TextField } from "@mui/material";
import { EmailOutlined, LinkOffOutlined } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

import AuthLayout from "../common/AuthLayout";
import PasswordField from "../common/PasswordField";
import { PasswordRules } from "./SignUp";
import { resetPassword } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotifyContext";
import { isStrongPassword } from "../../utils/validation";

/* Reads the token once and works out whether it is usable. */
const readToken = (search) => {
  const token = new URLSearchParams(search).get("token");
  if (!token) return { token: null, status: "missing" };
  try {
    const { email, exp } = jwtDecode(token);
    if (exp && exp * 1000 < Date.now()) return { token, status: "expired" };
    return { token, email, status: "ok" };
  } catch {
    return { token, status: "invalid" };
  }
};

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const { isSignedIn, signOut } = useAuth();

  const link = useMemo(() => readToken(location.search), [location.search]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // A reset link should never act on someone else's open session
  useEffect(() => {
    if (isSignedIn) signOut();
  }, [isSignedIn, signOut]);

  const passwordError = submitted && !isStrongPassword(password);
  const confirmError = submitted && password !== confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isStrongPassword(password) || password !== confirm) {
      notify(t("reset_password_page.fillValidFields"), "error");
      return;
    }

    setBusy(true);
    const res = await resetPassword(link.token, password);
    setBusy(false);

    if (res.success) {
      notify(t("reset_password_page.resetDone"));
      navigate("/signin", { replace: true });
    } else {
      notify(res.message || t("reset_password_page.resetFailed"), "error");
    }
  };

  if (link.status !== "ok") {
    const message = {
      missing: t("reset_password_page.missingToken"),
      expired: t("reset_password_page.tokenExpired"),
      invalid: t("reset_password_page.invalidToken"),
    }[link.status];

    return (
      <AuthLayout title={t("reset_password_page.linkProblem")}>
        <div className="auth-result">
          <div className="auth-result-icon error">
            <LinkOffOutlined />
          </div>
          <p>{message}</p>
          <Button component={Link} to="/forgot-password" variant="contained" fullWidth>
            {t("reset_password_page.requestNewLink")}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("reset_password_page.title")} subtitle={t("reset_password_page.subtitle")}>
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <TextField
          label={t("reset_password_page.email")}
          value={link.email || ""}
          disabled
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <PasswordField
          label={t("reset_password_page.newPassword")}
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          helperText={passwordError ? t("reset_password_page.invalidPasswordStrength") : ""}
        />
        <PasswordRules value={password} />
        <PasswordField
          label={t("reset_password_page.confirmPassword")}
          autoComplete="new-password"
          showToggle={false}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirmError}
          helperText={confirmError ? t("reset_password_page.passwordMismatch") : ""}
        />
        <Button type="submit" variant="contained" size="large" fullWidth disabled={busy}>
          {t("reset_password_page.resetPassword")}
        </Button>
      </form>

      <p className="auth-alt">
        {t("reset_password_page.rememberedPassword")}
        <Link to="/signin" className="text-link">
          {t("reset_password_page.signIn")}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
