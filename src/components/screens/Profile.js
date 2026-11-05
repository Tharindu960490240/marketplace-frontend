import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
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
  LockOutlined,
  PhoneOutlined,
  PhotoCameraOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/profile.css";

import * as AppConst from "../../const/const";
import {
  changePassword,
  deleteProfile,
  get_token,
  updateProfile,
  updateProfileImage,
} from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotifyContext";
import { isPhone, isStrongPassword } from "../../utils/validation";
import PasswordField from "../common/PasswordField";
import ConfirmDialog from "../common/ConfirmDialog";
import StatusChip from "../common/StatusChip";
import { PasswordRules } from "./SignUp";

const emptyPasswords = { oldPassword: "", newPassword: "", confirmPassword: "" };

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const { user, refreshUser, signOut } = useAuth();

  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [phone, setPhone] = useState(user?.phone || "");
  const [busy, setBusy] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setPhone(user?.phone || "");
  }, [user?.phone]);

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  /* ================= PHOTO ================= */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      notify(t("profile_page.onlyImagesAllowed"), "error");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const cancelImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleUpload = async () => {
    setBusy(true);
    const token = await get_token();
    const res = await updateProfileImage(token, image);
    setBusy(false);

    if (res.success) {
      notify(t("profile_page.imageUpdated"));
      cancelImage();
      refreshUser();
    } else {
      notify(res.message || t("profile_page.imageUploadFailed"), "error");
    }
  };

  /* ================= PHONE ================= */
  const phoneChanged = phone !== (user?.phone || "");
  const phoneError = phoneChanged && !isPhone(phone);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isPhone(phone)) {
      notify(t("profile_page.invalidContactNo"), "error");
      return;
    }
    setBusy(true);
    const token = await get_token();
    const res = await updateProfile(token, { phone });
    setBusy(false);

    if (res.success) {
      notify(t("profile_page.profileUpdated"));
      refreshUser();
    } else {
      notify(res.message || t("profile_page.profileUpdateFailed"), "error");
    }
  };

  /* ================= PASSWORD ================= */
  const pwErrors = {
    // Current password only needs to be entered — older accounts
    // may have passwords that predate the strength rule
    oldPassword: !passwords.oldPassword,
    newPassword: !isStrongPassword(passwords.newPassword),
    confirmPassword: passwords.newPassword !== passwords.confirmPassword,
  };

  const closePasswordDialog = () => {
    setPasswordOpen(false);
    setPasswords(emptyPasswords);
    setPasswordSubmitted(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSubmitted(true);
    if (Object.values(pwErrors).some(Boolean)) return;

    setBusy(true);
    const token = await get_token();
    const res = await changePassword(token, {
      oldPassword: passwords.oldPassword,
      newPassword: passwords.newPassword,
    });
    setBusy(false);

    if (res.success) {
      closePasswordDialog();
      signOut();
      notify(t("profile_page.passwordChangedSignIn"));
      navigate("/signin");
    } else {
      notify(res.message || t("profile_page.passwordResetFailed"), "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    setBusy(true);
    const token = await get_token();
    const res = await deleteProfile(token);
    setBusy(false);

    if (res.success) {
      setDeleteOpen(false);
      signOut();
      notify(t("profile_page.accountDeleted"));
      navigate("/home");
    } else {
      notify(res.message || t("profile_page.accountDeleteFailed"), "error");
    }
  };

  if (!user) return null;

  const avatarSrc = imagePreview || user.profile_image || AppConst.PROFILE_PLACEHOLDER_IMAGE;

  return (
    <div className="page narrow profile-page">
      {/* ================= IDENTITY ================= */}
      <section className="panel profile-hero">
        <button
          type="button"
          className="profile-avatar"
          onClick={() => fileInputRef.current?.click()}
          aria-label={t("profile_page.changePhoto")}
        >
          <Avatar src={avatarSrc} alt="" sx={{ width: 96, height: 96 }} />
          <span className="profile-avatar-edit">
            <PhotoCameraOutlined fontSize="small" />
          </span>
        </button>
        <input
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <div className="profile-identity">
          <h1>
            {user.first_name} {user.last_name}
          </h1>
          <p>{user.email}</p>
          <div className="profile-chips">
            <span className="role-chip">{t(`roles.${user.role}`, { defaultValue: user.role })}</span>
            <StatusChip status={user.status} />
          </div>
        </div>

        {image && (
          <div className="profile-photo-actions">
            <Button variant="contained" onClick={handleUpload} disabled={busy}>
              {t("profile_page.saveProfilePicture")}
            </Button>
            <Button color="inherit" onClick={cancelImage} disabled={busy}>
              {t("common.cancel")}
            </Button>
          </div>
        )}
      </section>

      {/* ================= CONTACT ================= */}
      <section className="panel">
        <h2 className="panel-title">{t("profile_page.personalInfo")}</h2>
        <form className="profile-row" onSubmit={handleUpdateProfile} noValidate>
          <TextField
            label={t("profile_page.phone")}
            value={phone}
            inputMode="numeric"
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            error={phoneError}
            helperText={phoneError ? t("profile_page.invalidContactNo") : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" disabled={busy || !phoneChanged}>
            {t("profile_page.saveChanges")}
          </Button>
        </form>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="panel">
        <div className="profile-row">
          <div>
            <h2 className="panel-title">{t("profile_page.security")}</h2>
            <p className="muted">{t("profile_page.securityText")}</p>
          </div>
          <Button
            variant="outlined"
            startIcon={<LockOutlined />}
            onClick={() => setPasswordOpen(true)}
          >
            {t("profile_page.changePassword")}
          </Button>
        </div>
      </section>

      {/* ================= DANGER ZONE ================= */}
      {user.role !== "admin" && (
        <section className="panel danger-zone">
          <div className="profile-row">
            <div>
              <h2 className="panel-title">{t("profile_page.dangerZone")}</h2>
              <p className="muted">{t("profile_page.permanentlyDeleteAccount")}</p>
            </div>
            <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
              {t("profile_page.deleteAccount")}
            </Button>
          </div>
        </section>
      )}

      {/* ================= PASSWORD DIALOG ================= */}
      <Dialog open={passwordOpen} onClose={busy ? undefined : closePasswordDialog} fullWidth maxWidth="xs">
        <form onSubmit={handlePasswordChange} noValidate>
          <DialogTitle>
            {t("profile_page.resetPassword")}
            <IconButton
              onClick={closePasswordDialog}
              aria-label={t("common.close")}
              sx={{ position: "absolute", right: 12, top: 12 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="dialog-fields">
              <PasswordField
                label={t("profile_page.oldPassword")}
                autoComplete="current-password"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, oldPassword: e.target.value }))}
                error={passwordSubmitted && pwErrors.oldPassword}
                helperText={
                  passwordSubmitted && pwErrors.oldPassword ? t("profile_page.oldPasswordRequired") : ""
                }
              />
              <PasswordField
                label={t("profile_page.newPassword")}
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                error={passwordSubmitted && pwErrors.newPassword}
                helperText={
                  passwordSubmitted && pwErrors.newPassword
                    ? t("profile_page.invalidPasswordStrength")
                    : ""
                }
              />
              <PasswordRules value={passwords.newPassword} />
              <PasswordField
                label={t("profile_page.confirmPassword")}
                autoComplete="new-password"
                showToggle={false}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                error={passwordSubmitted && pwErrors.confirmPassword}
                helperText={
                  passwordSubmitted && pwErrors.confirmPassword
                    ? t("profile_page.passwordMismatch")
                    : ""
                }
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={closePasswordDialog} disabled={busy}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="contained" disabled={busy}>
              {t("profile_page.updatePassword")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title={t("profile_page.confirmAccountDeletion")}
        message={t("profile_page.confirmAccountDeletionMessage")}
        confirmLabel={t("profile_page.deleteAccount")}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
        busy={busy}
      />
    </div>
  );
};

export default Profile;
