import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import { IosShareRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNotify } from "../../context/NotifyContext";
import { shareOrCopy } from "../../utils/share";

const ShareButton = ({ url, title, size = "small", className = "" }) => {
  const { t } = useTranslation();
  const notify = useNotify();

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // don't open the card underneath

    const result = await shareOrCopy({
      url: url || window.location.href,
      title: title || document.title,
    });

    if (result === "copied") notify(t("share_component.copied"));
    if (result === "failed") notify(t("share_component.failed_copy"), "error");
  };

  return (
    <Tooltip title={t("share_component.share_tooltip")}>
      <IconButton
        className={`icon-btn ${className}`}
        size={size}
        onClick={handleShare}
        aria-label={t("share_component.share_tooltip")}
      >
        <IosShareRounded fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default ShareButton;
