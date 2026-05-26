import React, { useState } from "react";
import { Tooltip, IconButton } from "@mui/material";
import { IosShare } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import CustomSnackbar from "./CustomSnackbar";

const ShareButton = ({ url, title, size = "small", color = "primary" }) => {
  const { t } = useTranslation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const handleShare = async (e) => {
    e.stopPropagation(); // Prevents card or parent click triggers

    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    // 1. Try Native Mobile/Browser Sharing (Requires HTTPS on Hosted Apps)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return; // Success, exit function
      } catch (error) {
        if (error.name !== "AbortError") {
          return setSnackbar({
            open: true,
            severity: "error",
            message: t("share_component.error"),
          });
        }
        return; // User canceled the share tray, exit cleanly
      }
    }

    // 2. Try Modern Clipboard API Fallback (Requires HTTPS on Hosted Apps)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        return setSnackbar({
          open: true,
          severity: "success",
          message: t("share_component.copied"),
        });
      } catch (err) {
        // Fail silently here and fall through to the legacy textarea method below
      }
    }

    // 3. Robust Legacy Textarea Fallback (Works on HTTP, Hosted Sites & Old Browsers)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;

      // Ensure element stays hidden from view and doesn't scroll mobile viewports
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setSnackbar({
          open: true,
          severity: "success",
          message: t("share_component.copied"),
        });
      } else {
        throw new Error("Copy command execution failed.");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: t("share_component.failed_copy"),
      });
    }
  };

  return (
    <>
      <Tooltip title={t("share_component.share_tooltip")}>
        <IconButton
          className="button-share"
          color={color}
          onClick={handleShare}
        >
          <IosShare color={color} fontSize={size} />
        </IconButton>
      </Tooltip>

      <CustomSnackbar
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default ShareButton;
