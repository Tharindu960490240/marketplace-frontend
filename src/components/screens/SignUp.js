import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  Close,
  EmailOutlined,
  MarkEmailReadOutlined,
  PersonOutline,
  PhoneOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import AuthLayout from "../common/AuthLayout";
import PasswordField from "../common/PasswordField";
import { registerUser } from "../../services/authService";
import { useNotify } from "../../context/NotifyContext";
import {
  isEmail,
  isName,
  isPhone,
  isStrongPassword,
} from "../../utils/validation";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

/* Live checklist so people see which password rule is missing */
export const PasswordRules = ({ value }) => {
  const { t } = useTranslation();
  const rules = [
    { ok: value.length >= 8, label: t("password_rules.length") },
    { ok: /[A-Z]/.test(value), label: t("password_rules.upper") },
    { ok: /[a-z]/.test(value), label: t("password_rules.lower") },
    { ok: /\d/.test(value), label: t("password_rules.number") },
    { ok: /[@$!%*?&]/.test(value), label: t("password_rules.special") },
  ];
  return (
    <div className="password-rules" aria-live="polite">
      {rules.map((r) => (
        <span key={r.label} className={`password-rule ${r.ok ? "ok" : ""}`}>
          {r.label}
        </span>
      ))}
    </div>
  );
};

const SignUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();

  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const errors = {
    first_name: !isName(form.first_name),
    last_name: !isName(form.last_name),
    email: !isEmail(form.email),
    phone: !isPhone(form.phone),
    password: !isStrongPassword(form.password),
    confirmPassword: !form.confirmPassword || form.password !== form.confirmPassword,
  };

  const show = (field) => (submitted || touched[field]) && errors[field];

  const bind = (field) => ({
    value: form[field],
    onChange: (e) => setForm((f) => ({ ...f, [field]: e.target.value })),
    onBlur: () => setTouched((tch) => ({ ...tch, [field]: true })),
    error: show(field),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.values(errors).some(Boolean)) {
      notify(t("signup_page.fillValidFields"), "error");
      return;
    }

    setBusy(true);
    const res = await registerUser({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    setBusy(false);

    if (res.success) {
      setDoneOpen(true);
    } else {
      notify(res.message || t("signup_page.accountCreateFailed"), "error");
    }
  };

  const finish = () => {
    setDoneOpen(false);
    navigate("/signin");
  };

  return (
    <AuthLayout title={t("signup_page.signUpTitle")} subtitle={t("signup_page.subtitle")} wide>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <TextField
            label={t("signup_page.firstName")}
            autoComplete="given-name"
            {...bind("first_name")}
            helperText={show("first_name") ? t("signup_page.firstNameError") : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label={t("signup_page.lastName")}
            autoComplete="family-name"
            {...bind("last_name")}
            helperText={show("last_name") ? t("signup_page.lastNameError") : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label={t("signup_page.email")}
            type="email"
            autoComplete="email"
            {...bind("email")}
            helperText={show("email") ? t("signup_page.emailError") : t("signup_page.emailHint")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label={t("signup_page.contactNo")}
            autoComplete="tel"
            inputMode="numeric"
            {...bind("phone")}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm((f) => ({ ...f, phone: v }));
            }}
            helperText={show("phone") ? t("signup_page.contactError") : t("signup_page.contactHint")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <PasswordField
            label={t("signup_page.newPassword")}
            autoComplete="new-password"
            {...bind("password")}
            helperText={show("password") ? t("signup_page.invalidPasswordStrength") : ""}
          />
          <PasswordField
            label={t("signup_page.confirmPassword")}
            autoComplete="new-password"
            showToggle={false}
            {...bind("confirmPassword")}
            helperText={show("confirmPassword") ? t("signup_page.passwordMismatch") : ""}
          />
          <div className="span-2">
            <PasswordRules value={form.password} />
          </div>
        </div>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          className="auth-submit"
          disabled={busy}
        >
          {busy ? t("signup_page.creating") : t("signup_page.createAccount")}
        </Button>
      </form>

      <p className="auth-alt">
        {t("signup_page.alreadyHaveAccount")}
        <Link to="/signin" className="text-link">
          {t("signup_page.signInLink")}
        </Link>
      </p>
      <p className="auth-help">
        <button type="button" className="text-link" onClick={() => setHelpOpen(true)}>
          {t("signup_page.help_dialog.title")}
        </button>
      </p>

      {/* ===== Account created ===== */}
      <Dialog open={doneOpen} onClose={finish} fullWidth maxWidth="xs">
        <DialogContent>
          <div className="auth-result">
            <div className="auth-result-icon success">
              <MarkEmailReadOutlined />
            </div>
            <h2>{t("signup_page.verifyEmailTitle")}</h2>
            <p>{t("signup_page.verifyEmailText2")}</p>
            <p>{t("signup_page.verifyEmailText3")}</p>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="contained" fullWidth onClick={finish}>
            {t("signup_page.goToSignIn")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Help ===== */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {t("signup_page.help_dialog.title")}
          <IconButton
            onClick={() => setHelpOpen(false)}
            aria-label={t("common.close")}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ol className="help-steps">
            <li>
              <strong>{t("signup_page.help_dialog.step1_title")}</strong>
              <p>{t("signup_page.help_dialog.step1_text")}</p>
            </li>
            <li>
              <strong>{t("signup_page.help_dialog.step2_title")}</strong>
              <p>{t("signup_page.help_dialog.step2_text")}</p>
              <p>{t("signup_page.help_dialog.password_examples")}</p>
            </li>
            <li>
              <strong>{t("signup_page.help_dialog.step3_title")}</strong>
              <p>{t("signup_page.help_dialog.step3_text")}</p>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
};

export default SignUp;
