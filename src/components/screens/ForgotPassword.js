import React, { useState } from "react";
import {
Email
} from "@mui/icons-material";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Link, useNavigate } from "react-router-dom";
import "../styles/frogotPassword.css";
import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import {
  sendPasswordResetLink
} from "../../services/authService";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    isValidUser: true,
    check_email_Change: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  // Handle Email Input Change
  const handleEmailChange = (val) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setData({
      ...data,
      email: val,
      isValidUser: isValidEmail,
      check_email_Change: isValidEmail,
    });
  };

  // Handle Password Reset (Only sending email for reset link)
  const handlePasswordReset = async () => {
    // 1. Basic validation
    if (!data.email || !data.isValidUser) {
      setSnackbar({
        open: true,
        message: "Please enter a valid email address",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // 2. Call API
      const response = await sendPasswordResetLink(data.email);

      if (response.success) {
        setSnackbar({
          open: true,
          message: "Password reset link sent to your email",
          severity: "success",
        });

        setData((prev) => ({
          ...prev,
          email: "",
          check_email_Change: false,
        }));

        // optional: redirect after delay
        setTimeout(() => {
          navigate("/signin");
        }, 2500);
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Failed to send reset link",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Something went wrong",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Snackbar Close
  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>Forgot Password</h2>

        <div className="input-container">
          <TextField
            size="small"
            label="Email"
            type="email"
            fullWidth
            value={data.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            margin="normal"
            variant="outlined"
            className="custom-textfield"
            error={!data.isValidUser}
            helperText={!data.isValidUser ? "Invalid email address.." : ""}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="var(--muted-color)" />
                </InputAdornment>
              ),
              endAdornment: data.check_email_Change ? (
                <InputAdornment position="end">
                  <span style={{ color: "green" }}>✔</span>
                </InputAdornment>
              ) : null,
            }}
          />
        </div>

        {/* Reset Button */}
        <div className="button-group">
          <button className="button-success" onClick={handlePasswordReset}>
            Send Reset Link
          </button>
        </div>

        {/* Sign In Link */}
        <p className="signin-link">
          Remembered your password? <Link to="/signin">Sign In</Link>
        </p>
      </div>

      {/* Snackbar */}
      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default ForgotPassword;
