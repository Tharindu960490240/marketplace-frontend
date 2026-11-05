import React, { createContext, useCallback, useContext, useState } from "react";
import CustomSnackbar from "../components/screens/CustomSnackbar";

/* One app-wide snackbar instead of one per screen.
   Usage: const notify = useNotify(); notify("Saved"); notify("Oops", "error"); */

const NotifyContext = createContext(() => {});

export const NotifyProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    message: "",
    severity: "success",
    key: 0,
  });

  const notify = useCallback((message, severity = "success") => {
    setState({ open: true, message, severity, key: Date.now() });
  }, []);

  const handleClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <CustomSnackbar
        key={state.key}
        open={state.open}
        message={state.message}
        severity={state.severity}
        onClose={handleClose}
      />
    </NotifyContext.Provider>
  );
};

export const useNotify = () => useContext(NotifyContext);
