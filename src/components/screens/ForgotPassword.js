import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, InputAdornment, TextField } from "@mui/material";
import { EmailOutlined, MarkEmailReadOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import AuthLayout from "../common/AuthLayout";
import { sendPasswordResetLink } from "../../services/authService";
import { useNotify } from "../../context/NotifyContext";
import { isEmail } from "../../utils/validation";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const notify = useNotify();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const emailError = submitted && !isEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isEmail(email)) {
      notify(t("frorgotPassword_page.enterValidEmail"), "error");
      return;
    }

    setBusy(true);
    const res = await sendPasswordResetLink(email.trim());
    setBusy(false);

    if (res.success) {
      // Stay on the page and show what happened (no silent redirect)
      setSentTo(email.trim());
    } else {
      notify(res.message || t("frorgotPassword_page.resetFailedLink"), "error");
    }
  };

  if (sentTo) {
    return (
      <AuthLayout title={t("frorgotPassword_page.checkInbox")}>
        <div className="auth-result">
          <div className="auth-result-icon success">
            <MarkEmailReadOutlined />
          </div>
          <p>{t("frorgotPassword_page.sentTo", { email: sentTo })}</p>
          <Button component={Link} to="/signin" variant="contained" fullWidth>
            {t("frorgotPassword_page.backToSignIn")}
          </Button>
          <button type="button" className="text-link" onClick={() => setSentTo("")}>
            {t("frorgotPassword_page.useAnotherEmail")}
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("frorgotPassword_page.forgotPasswordTitle")}
      subtitle={t("frorgotPassword_page.subtitle")}
    >
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <TextField
          label={t("frorgotPassword_page.email")}
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          helperText={emailError ? t("frorgotPassword_page.emailError") : ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button type="submit" variant="contained" size="large" fullWidth disabled={busy}>
          {t("frorgotPassword_page.sendResetLink")}
        </Button>
      </form>

      <p className="auth-alt">
        {t("frorgotPassword_page.rememberedPassword")}
        <Link to="/signin" className="text-link">
          {t("frorgotPassword_page.signIn")}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
