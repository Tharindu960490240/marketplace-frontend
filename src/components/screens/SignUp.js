import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Person,
  Lock,
  Phone,
  Visibility,
  VisibilityOff,
  Email,
  Close,
} from "@mui/icons-material";

import {
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import "../styles/signUp.css";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { registerUser } from "../../services/authService";

const SignUp = () => {
  const navigate = useNavigate();

  const initialUserData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    isValidFirstName: true,
    isValidLastName: true,
    isValidEmail: true,
    isValidPhone: true,
    isValidPassword: true,
    passwordMatch: true,
  };

  const [userData, setUserData] = useState(initialUserData);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    clearData();
    setLoading(false);
    navigate("/home");
  };

  // ================= VALIDATIONS =================

  const handleEmailChange = (val) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setUserData({ ...userData, email: val, isValidEmail });
  };

  const handleFirstNameChange = (val) => {
    const isValidFirstName = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(val);
    setUserData({ ...userData, first_name: val, isValidFirstName });
  };

  const handleLastNameChange = (val) => {
    const isValidLastName = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(val);
    setUserData({ ...userData, last_name: val, isValidLastName });
  };

  const handleContactNoChange = (val) => {
    const isValidPhone = /^\d{10}$/.test(val);
    setUserData({ ...userData, phone: val, isValidPhone });
  };

  const handlePasswordChange = (val) => {
    const isValidPassword = val.length >= 6;
    const passwordMatch = val === userData.confirmPassword;
    setUserData({
      ...userData,
      password: val,
      isValidPassword,
      passwordMatch,
    });
  };

  const handleConfirmPasswordChange = (val) => {
    const passwordMatch = val === userData.password;
    setUserData({ ...userData, confirmPassword: val, passwordMatch });
  };

  const togglePasswordVisibility = () => {
    setUserData({ ...userData, showPassword: !userData.showPassword });
  };

  const clearData = () => {
    setUserData(initialUserData);
  };

  const handleUserFormSubmit = async () => {
    const isFirstNameValid =
      /^[a-zA-Z]+$/.test(userData.first_name) && userData.first_name.length > 0;
    const isLastNameValid =
      /^[a-zA-Z]+$/.test(userData.last_name) && userData.last_name.length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email);
    const isContactNoValid = /^\d{10}$/.test(userData.phone);
    const isPasswordValid = userData.password.length >= 6;
    const matchPassword = userData.password === userData.confirmPassword;

    // Update the state with validation results
    setUserData({
      ...userData,
      isValidFirstName: isFirstNameValid,
      isValidLastName: isLastNameValid,
      isValidEmail: isEmailValid,
      isValidPhone: isContactNoValid,
      isValidPassword: isPasswordValid,
      passwordMatch: matchPassword,
    });

    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isEmailValid ||
      !isContactNoValid ||
      !isPasswordValid ||
      !matchPassword
    ) {
      setSnackbar({
        open: true,
        message: "Please fill in all the fields with valid information.",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    // Proceed with user creation if all validations pass
    try {
      const result = await registerUser(userData);
      if (result.success) {
        setSnackbar({
          open: true,
          message: "User account created successfully! Verify email to login.",
          severity: "success",
        });
        setDialogOpen(true);
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message:
            result.message ||
            "Failed to create user account. Please try again.",
          severity: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "An error occurred while adding the user. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>

        {/* Name */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            className="custom-textfield"
            size="small"
            label="First Name"
            value={userData.first_name}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            required
            error={!userData.isValidFirstName}
            helperText={
              !userData.isValidFirstName
                ? "Name must contain only letters."
                : "eg: Tharindu"
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="var(--muted-color)" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            className="custom-textfield"
            size="small"
            label="Last Name"
            value={userData.last_name}
            onChange={(e) => handleLastNameChange(e.target.value)}
            required
            error={!userData.isValidLastName}
            helperText={
              !userData.isValidLastName
                ? "Name must contain only letters."
                : "eg: Madusanka"
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="var(--muted-color)" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Email & Contact */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            className="custom-textfield"
            size="small"
            label="Email"
            value={userData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
            error={!userData.isValidEmail}
            helperText={
              !userData.isValidEmail
                ? "Invalid email format."
                : "example@abcd.com"
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="var(--muted-color)" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            className="custom-textfield"
            size="small"
            label="Contact No."
            value={userData.phone}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                handleContactNoChange(e.target.value);
              }
            }}
            required
            error={!userData.isValidPhone}
            helperText={
              !userData.isValidPhone
                ? "Contact number must be 10 digits."
                : "0123456789"
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="var(--muted-color)" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Password */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            className="custom-textfield"
            size="small"
            label="New Password"
            type={userData.showPassword ? "text" : "password"}
            value={userData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            error={!userData.isValidPassword}
            helperText={
              !userData.isValidPassword
                ? "Password must be at least 6 characters long."
                : ""
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="var(--muted-color)" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {userData.showPassword ? (
                      <Visibility color="var(--muted-color)" />
                    ) : (
                      <VisibilityOff color="var(--muted-color)" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            className="custom-textfield"
            size="small"
            label="Confirm Password"
            type={userData.showPassword ? "text" : "password"}
            value={userData.confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            required
            error={!userData.passwordMatch}
            helperText={
              !userData.passwordMatch ? "Passwords do not match." : ""
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="var(--muted-color)" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button onClick={handleUserFormSubmit} className="button-success">
            Create User Account
          </button>

          <button onClick={clearData} className="button-error">
            Cancel
          </button>
        </div>

        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Verify Your Email Address
          <IconButton
            onClick={handleDialogClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <DialogContentText>
            Your account has been created successfully
            <br />
            <br />
            We’ve sent a verification link to your email address. Please check
            your <b>Inbox</b> or <b>Spam/Junk folder</b> and click the link to
            activate your account.
            <br />
            <br />
            If you don’t receive the email within a few minutes, please contact
            support team.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}></DialogActions>
      </Dialog>
    </div>
  );
};

export default SignUp;
