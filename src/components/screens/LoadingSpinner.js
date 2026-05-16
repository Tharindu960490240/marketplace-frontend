import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 180,
  height: 160,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 2,
  borderRadius: 3,
  bgcolor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
  outline: "none",
};

const backdropStyle = {
  backdropFilter: "blur(6px)",
  backgroundColor: "rgba(0,0,0,0.4)",
};

const LoadingSpinner = ({ open }) => {
  return (
    <Modal
      open={open}
      closeAfterTransition
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      slotProps={{
        backdrop: {
          sx: backdropStyle,
        },
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <CircularProgress size={42} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
};

export default LoadingSpinner;
