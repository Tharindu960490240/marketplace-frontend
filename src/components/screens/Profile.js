import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  get_token,
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
  deleteProfile,
} from "../../services/authService";

import "../styles/profile.css";
import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";
import * as AppConst from "../../const/const";

import {
  Lock,
  Phone,
  Visibility,
  VisibilityOff,
  PhotoCamera,
  Close,
} from "@mui/icons-material";

import {
  Modal,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
} from "@mui/material";

import { useTranslation } from "react-i18next";

const Profile = ({ onSignOut, isSignedIn }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState(null);
  const [isValidContactNo, setIsValidContactNo] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ================= SNACKBAR =================
  const showMessage = (msg, type = "success") => {
    setSnackbar({
      open: true,
      message: msg,
      severity: type,
    });
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ================= FETCH USER =================
  const fetchUser = useCallback(async () => {
    try {
      const token = await get_token();

      if (!token) {
        showMessage(t("profile_page.sessionExpired"), "error");
        setLoading(false);
        return;
      }

      const res = await getProfile(token);

      if (res.success) {
        setUser(res.user);
        setPhone(res.user.phone);
        setIsValidContactNo(/^\d{10}$/.test(res.user.phone || ""));
      } else {
        showMessage(res.message || "Failed to load profile", "error");
      }
    } catch (err) {
      showMessage(
        err?.response?.data?.message || "Failed to load profile",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ================= UPDATE PROFILE =================
  const handleUpdateProfile = async () => {
    try {
      const token = await get_token();

      if (!token) {
        showMessage(t("profile_page.sessionExpired"), "error");
        return;
      }

      const isValidContactNo = /^\d{10}$/.test(phone);
      setIsValidContactNo(isValidContactNo);

      if (!isValidContactNo) {
        setSnackbar({
          open: true,
          message: t("profile_page.fillValidFields"),
          severity: "error",
        });
        return;
      }

      setLoading(true);

      const res = await updateProfile(token, { phone });

      if (res.success) {
        showMessage(t("profile_page.profileUpdated"), "success");
        await fetchUser();
      } else {
        showMessage(t("profile_page.profileUpdateFailed"), "error");
      }
    } catch (err) {
      showMessage(t("profile_page.profileUpdateFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleContactNoChange = (val) => {
    const isValidContactNo = /^\d{10}$/.test(val);
    setPhone(val);
    setIsValidContactNo(isValidContactNo);
  };

  // ================= IMAGE VALIDATION =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      showMessage(t("profile_page.onlyImagesAllowed"), "error");
      return;
    }

    setImage(file);

    //  create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ================= UPLOAD IMAGE =================
  const handleUpload = async () => {
    if (!image) {
      showMessage(t("profile_page.selectImageFirst"), "error");
      return;
    }

    try {
      const token = await get_token();

      if (!token) {
        showMessage(t("profile_page.sessionExpired"), "error");
        return;
      }

      setLoading(true);

      const res = await updateProfileImage(token, image);

      if (res.success) {
        showMessage(t("profile_page.imageUpdated"), "success");
        setImage(null);
        await fetchUser();
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        showMessage(t("profile_page.imageUploadFailed"), "error");
      }
    } catch (err) {
      showMessage(t("profile_page.imageUploadFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN FILE DIALOG =================
  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetData, setResetData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    showPassword: false,
    isValidOldPassword: true,
    isValidPassword: true,
    passwordMatch: true,
  });

  // Reset Password Modal Logic
  const handlePasswordModalOpen = () => {
    setResetData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      showPassword: false,
      isValidOldPassword: true,
      isValidPassword: true,
      passwordMatch: true,
    });
    setShowPasswordModal(true);
  };

  const handleOldPasswordChange = (event) => {
    const oldPassword = event.target.value;
    setResetData({
      ...resetData,
      oldPassword,
      isValidOldPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          oldPassword,
        ),
    });
  };

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setResetData({
      ...resetData,
      newPassword,
      isValidPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          newPassword,
        ),
      passwordMatch: newPassword === resetData.confirmPassword,
    });
  };

  const handleConfirmPasswordChange = (event) => {
    const confirmPassword = event.target.value;
    setResetData({
      ...resetData,
      confirmPassword,
      passwordMatch: confirmPassword === resetData.newPassword,
    });
  };

  const toggleShowPassword = () => {
    setResetData({ ...resetData, showPassword: !resetData.showPassword });
  };

  const handlePasswordReset = async () => {
    const token = await get_token();

    if (!token) {
      showMessage(t("profile_page.sessionExpired"), "error");
      return;
    }

    const isOldPasswordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        resetData.oldPassword,
      );
    const isPasswordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        resetData.newPassword,
      );
    const matchPassword = resetData.newPassword === resetData.confirmPassword;

    // Update the state with the latest validation results
    setResetData({
      ...resetData,
      isValidOldPassword: isOldPasswordValid,
      isValidPassword: isPasswordValid,
      passwordMatch: matchPassword,
    });

    if (!isOldPasswordValid || !isPasswordValid || !matchPassword) {
      setSnackbar({
        open: true,
        message: t("profile_page.fillValidFields"),
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(token, {
        newPassword: resetData.newPassword,
        oldPassword: resetData.oldPassword,
      });
      if (result.success) {
        setSnackbar({
          open: true,
          message: t("profile_page.passwordResetSuccess"),
          severity: "success",
        });
        // Log out the user after password reset
        setTimeout(() => {
          setShowPasswordModal(false);
          setLoading(false);
          handleLogout();
        }, 2500);
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message: result.message || t("profile_page.passwordResetFailed"),
          severity: "error",
        });
      }
    } catch (error) {
      // Handle any errors during the password reset process
      setLoading(false);
      setSnackbar({
        open: true,
        message: t("profile_page.passwordResetFailed"),
        severity: "error",
      });
      console.error("Password reset error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();

    setLoading(true);
    setSnackbar({
      open: true,
      message: t("profile_page.loggedOut"),
      severity: "success",
    });

    setTimeout(() => {
      setLoading(false);
      onSignOut();
      navigate("/home");
    }, 2500);
  };

  const handleDelete = async () => {
    const token = await get_token();

    if (!token) {
      showMessage(t("profile_page.sessionExpired"), "error");
      return;
    }

    setLoading(true);

    try {
      const res = await deleteProfile(token);

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("profile_page.accountDeleted"),
          severity: "success",
        });

        // close dialog
        setDeleteDialogOpen(false);
        setTimeout(() => {
          setLoading(false);
          handleLogout();
        }, 2500);
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message: res.message || t("profile_page.accountDeleteFailed"),
          severity: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: t("profile_page.accountDeleteFailed"),
        severity: "error",
      });
    }
  };

  if (!user) return <LoadingSpinner open={!user} />;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* ================= COVER ================= */}
        <div className="profile-header">
          <div className="profile-image-box" onClick={openFilePicker}>
            <Avatar
              className="profile_img"
              src={
                imagePreview
                  ? imagePreview
                  : user.profile_image
                    ? user.profile_image
                    : AppConst.PROFILE_PLACEHOLDER_IMAGE
              }
              alt="profile"
            />
            <div className="edit-icon">
              <PhotoCamera />
            </div>
          </div>
        </div>

        {/* ================= BASIC INFO ================= */}
        <div className="profile-basic-info">
          <h2>
            {user.first_name} {user.last_name}
          </h2>
          <p>{user.email}</p>

          <div className="button-group">
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              disabled={!image}
              className={image ? "button-success" : "button-disable"}
              onClick={handleUpload}
            >
              {t("profile_page.upload")}
            </button>

            <button
              className="button-success"
              onClick={handlePasswordModalOpen}
            >
              {t("profile_page.changePassword")}
            </button>
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="profile-stats">
          <div className="stat-item">
            <h3>{t("profile_page.role")}</h3>
            <span>{user.role}</span>
          </div>
          <div className="stat-item">
            <h3>{t("profile_page.status")}</h3>
            <span>{user.status}</span>
          </div>
        </div>

        {/* ================= SECTIONS ================= */}
        <div className="profile-sections">
          {/* PERSONAL INFO */}
          <div className="section-card">
            <h3 className="profile-sections-title">
              {t("profile_page.personalInfo")}
            </h3>

            <div className="info-row">
              <span className="info-label">{t("profile_page.phone")}</span>
              <TextField
                className="custom-textfield"
                size="small"
                value={phone}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) {
                    handleContactNoChange(e.target.value);
                  }
                }}
                error={!isValidContactNo}
                helperText={
                  !isValidContactNo ? t("profile_page.invalidContactNo") : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <button className="button-success" onClick={handleUpdateProfile}>
              {t("profile_page.saveChanges")}
            </button>
          </div>

          {/* DANGER ZONE */}
          <div hidden={user?.role === "admin"} className="danger-zone">
            <h3>{t("profile_page.dangerZone")}</h3>
            <p>{t("profile_page.permanentlyDeleteAccount")}</p>

            <button
              className="button-error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              {t("profile_page.deleteAccount")}
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal open={showPasswordModal}>
        <div className="reset-password-modal">
          <IconButton
            onClick={() => setShowPasswordModal(false)}
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              color: "var(--muted-color)",
            }}
          >
            <Close />
          </IconButton>
          <h2 className="modal-title">{t("profile_page.resetPassword")}</h2>

          <div className="input-container">
            <TextField
              className="custom-textfield"
              size="small"
              label={t("profile_page.oldPassword")}
              type={resetData.showPassword ? "text" : "password"}
              value={resetData.oldPassword}
              onChange={handleOldPasswordChange}
              fullWidth
              margin="normal"
              variant="outlined"
              error={!resetData.isValidOldPassword}
              helperText={
                !resetData.isValidOldPassword
                  ? t("profile_page.invalidPasswordStrength")
                  : ""
              }
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword}>
                      {resetData.showPassword ? (
                        <Visibility />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="input-container">
            <TextField
              className="custom-textfield"
              size="small"
              label={t("profile_page.newPassword")}
              type={resetData.showPassword ? "text" : "password"}
              value={resetData.newPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              variant="outlined"
              error={!resetData.isValidPassword}
              helperText={
                !resetData.isValidPassword
                  ? t("profile_page.invalidPasswordStrength")
                  : ""
              }
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword}>
                      {resetData.showPassword ? (
                        <Visibility />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="input-container">
            <TextField
              className="custom-textfield"
              size="small"
              label={t("profile_page.confirmPassword")}
              type={resetData.showPassword ? "text" : "password"}
              value={resetData.confirmPassword}
              onChange={handleConfirmPasswordChange}
              fullWidth
              margin="normal"
              variant="outlined"
              error={!resetData.passwordMatch}
              required
              helperText={
                !resetData.passwordMatch
                  ? t("profile_page.passwordMismatch")
                  : ""
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="button-group">
            <button onClick={handlePasswordReset} className="button-success">
              {t("profile_page.save")}
            </button>

            <button
              onClick={() => setShowPasswordModal(false)}
              className="button-error"
            >
              {t("profile_page.cancel")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ================= SNACKBAR ================= */}
      <CustomSnackbar {...snackbar} onClose={handleClose} />

      {/* ================= LOADING ================= */}
      <LoadingSpinner open={loading} />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-dialog-title">
          {t("profile_page.confirmAccountDeletion")}
          <IconButton
            aria-label="close"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            {t("profile_page.confirmAccountDeletionMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <button
            className="button-success"
            onClick={() => setDeleteDialogOpen(false)}
          >
            {t("profile_page.cancel")}
          </button>
          <button className="button-error" onClick={handleDelete}>
            {t("profile_page.deleteAccount")}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;
