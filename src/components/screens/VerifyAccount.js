import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, CircularProgress } from "@mui/material";
import { CheckRounded, ErrorOutlineRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import AuthLayout from "../common/AuthLayout";
import { verifyEmail } from "../../services/authService";

const VerifyAccount = () => {
  const { t } = useTranslation();
  const { token } = useParams();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const requested = useRef(null);

  useEffect(() => {
    // Verification tokens are single-use: call the API only once per token
    // (StrictMode and language changes used to trigger a second, failing call)
    if (requested.current === token) return;
    requested.current = token;

    verifyEmail(token).then((res) => {
      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    });
  }, [token]);

  return (
    <AuthLayout title={t("verify_account_page.title")}>
      <div className="auth-result">
        {status === "loading" && (
          <>
            <CircularProgress />
            <h2>{t("verify_account_page.verifyingAccount")}</h2>
            <p>{t("verify_account_page.verifySubtext")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="auth-result-icon success">
              <CheckRounded />
            </div>
            <h2>{t("verify_account_page.verifySuccess")}</h2>
            <p>{t("verify_account_page.successText")}</p>
            <Button component={Link} to="/signin" variant="contained" fullWidth>
              {t("signin_page.signIn")}
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="auth-result-icon error">
              <ErrorOutlineRounded />
            </div>
            <h2>{t("verify_account_page.verifyFailed")}</h2>
            {message && <p>{message}</p>}
            <Button href="mailto:info@agrilinkservices.com" variant="outlined" fullWidth>
              {t("header.contactUs")}
            </Button>
            <Link to="/home" className="text-link">
              {t("verify_account_page.goHome")}
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyAccount;
