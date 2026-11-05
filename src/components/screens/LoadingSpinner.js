import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { useTranslation } from "react-i18next";

import "../styles/loadingSpinner.css";

/* Full-screen loader — only for app start-up and blocking actions. */
const LoadingSpinner = ({ open }) => {
  const { t } = useTranslation();

  return (
    <Backdrop open={!!open} className="loading-backdrop">
      <div className="loading-box" role="status" aria-live="polite">
        <CircularProgress size={36} thickness={4.5} />
        <span className="loading-text">{t("loading")}</span>
      </div>
    </Backdrop>
  );
};

export default LoadingSpinner;
