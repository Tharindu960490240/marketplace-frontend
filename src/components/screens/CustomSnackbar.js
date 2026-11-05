import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import useMediaQuery from "@mui/material/useMediaQuery";

const CustomSnackbar = ({ open, severity = "success", message, onClose }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Snackbar
      anchorOrigin={
        isMobile
          ? { vertical: "bottom", horizontal: "center" }
          : { vertical: "top", horizontal: "right" }
      }
      open={open}
      autoHideDuration={3500}
      onClose={onClose}
      sx={{ top: { sm: 80 } }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%", alignItems: "center", fontWeight: 600 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
