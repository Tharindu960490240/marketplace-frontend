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

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setSnackbar({
            open: true,
            severity: "error",
            message: t("share_component.error"),
          });
        }
      }
    } else {
      // Fallback copying mechanism to Clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setSnackbar({
          open: true,
          severity: "success",
          message: t("share_component.copied"),
        });
      } catch (err) {
        setSnackbar({
          open: true,
          severity: "error",
          message: t("share_component.failed_copy"),
        });
      }
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
