import React from "react";
import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

const COLORS = {
  active: "success",
  open: "success",
  pending: "warning",
  sold: "info",
  rejected: "error",
  suspended: "error",
  deleted: "default",
  inactive: "default",
  closed: "default",
};

/* One chip for every status in the app (ads, users, categories, tickets). */
const StatusChip = ({ status, size = "small", className = "" }) => {
  const { t } = useTranslation();
  if (!status) return null;

  return (
    <Chip
      className={`status-chip ${className}`}
      size={size}
      color={COLORS[status] || "default"}
      variant={COLORS[status] && COLORS[status] !== "default" ? "filled" : "outlined"}
      label={t(`status.${status}`, { defaultValue: status })}
    />
  );
};

export default StatusChip;
