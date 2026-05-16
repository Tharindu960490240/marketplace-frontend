import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { verifyEmail } from "../../services/authService";
import { ROUTES } from "../../const/const";

import "../styles/verifyAccount.css";

const VerifyAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);

      try {
        const result = await verifyEmail(token);

        if (result.success) {
          setSnackbar({
            open: true,
            message: result.data.message || "Account verified successfully!",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: result.message || "Verification failed",
            severity: "error",
          });
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message:
            err?.response?.data?.message ||
            "Something went wrong during verification",
          severity: "error",
        });
      } finally {
        setLoading(false);

        setTimeout(() => {
          navigate(ROUTES.HOME);
        }, 2500);
      }
    };

    verifyUser();
  }, [token, navigate]);

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2 className="verify-title">Verifying your account...</h2>

        <p className="verify-subtext">
          Please wait while we confirm your email address.
        </p>

        {/* Spinner */}
        <LoadingSpinner open={loading} />

        {/* Snackbar */}
        <CustomSnackbar {...snackbar} onClose={handleClose} />
      </div>
    </div>
  );
};

export default VerifyAccount;