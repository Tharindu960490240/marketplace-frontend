import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, InputAdornment, TextField } from "@mui/material";
import { EmailOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import AuthLayout from "../common/AuthLayout";
import PasswordField from "../common/PasswordField";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotifyContext";
import { isEmail } from "../../utils/validation";

const SignIn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailError = submitted && !isEmail(email);
  const passwordError = submitted && !password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isEmail(email) || !password) {
      notify(t("signin_page.validEmailPassword"), "error");
      return;
    }

    setBusy(true);
    const res = await loginUser({ email: email.trim(), password });

    if (!res.success || !res.data?.token) {
      setBusy(false);
      notify(res.message || t("signin_page.loginFailed"), "error");
      return;
    }

    const user = await signIn(res.data.token);
    setBusy(false);

    if (!user) {
      notify(t("signin_page.unexpectedError"), "error");
      return;
    }

    notify(t("signin_page.loginSuccess"));
    const fallback = user.role === "admin" ? "/dashboard" : "/home";
    navigate(location.state?.from || fallback, { replace: true });
  };

  return (
    <AuthLayout title={t("signin_page.title")} subtitle={t("signin_page.subtitle")}>
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <TextField
          label={t("signin_page.email")}
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          helperText={emailError ? t("signin_page.emailError") : ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <PasswordField
          label={t("signin_page.password")}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          helperText={passwordError ? t("signin_page.passwordRequired") : ""}
        />

        <div className="auth-row">
          <Link to="/forgot-password" className="text-link">
            {t("signin_page.forgotPassword")}
          </Link>
        </div>

        <Button type="submit" variant="contained" size="large" fullWidth disabled={busy}>
          {busy ? t("signin_page.signingIn") : t("signin_page.signIn")}
        </Button>
      </form>

      <p className="auth-alt">
        {t("signin_page.dontHaveAccount")}
        <Link to="/signup" className="text-link">
          {t("signin_page.signUp")}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignIn;
