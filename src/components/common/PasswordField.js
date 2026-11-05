import React, { useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

/* TextField with its own show/hide toggle. */
const PasswordField = ({ showToggle = true, ...props }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  return (
    <TextField
      {...props}
      type={show ? "text" : "password"}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LockOutlined fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: showToggle ? (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              size="small"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? t("common.hide_password") : t("common.show_password")}
            >
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
};

export default PasswordField;
