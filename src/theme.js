import { createTheme } from "@mui/material/styles";

/* Brand palette taken from the Agri Link logo (navy + azure). */
export const palette = {
  light: {
    bg: "#F4F6FB",
    surface: "#FFFFFF",
    surface2: "#EEF2FA",
    border: "#DFE5F0",
    text: "#0F1B3D",
    muted: "#5B6787",
    primary: "#1F46B0",
    primaryStrong: "#14245C",
    accent: "#2F86F6",
    success: "#1E8E5A",
    warning: "#B86E06",
    danger: "#D23B4B",
  },
  dark: {
    bg: "#0B1226",
    surface: "#121B33",
    surface2: "#18233F",
    border: "#25314F",
    text: "#E7ECF7",
    muted: "#98A3BF",
    primary: "#6B97F7",
    primaryStrong: "#3D70E6",
    accent: "#7FB2FF",
    success: "#3FC587",
    warning: "#F0A93B",
    danger: "#F06A78",
  },
};

export const buildTheme = (mode, language) => {
  const p = palette[mode];
  const fontFamily =
    language === "si"
      ? '"Noto Sans Sinhala", "Manrope", system-ui, sans-serif'
      : '"Manrope", "Noto Sans Sinhala", system-ui, sans-serif';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: p.primary,
        dark: p.primaryStrong,
        // light blue on dark mode needs dark text to stay readable
        contrastText: mode === "dark" ? "#0B1226" : "#FFFFFF",
      },
      secondary: { main: p.accent },
      success: { main: p.success },
      warning: { main: p.warning },
      error: { main: p.danger },
      info: { main: p.accent },
      background: { default: p.bg, paper: p.surface },
      text: { primary: p.text, secondary: p.muted },
      divider: p.border,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily,
      button: { textTransform: "none", fontWeight: 700, letterSpacing: 0 },
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 18, minHeight: 42 },
          sizeSmall: { minHeight: 34, paddingInline: 12 },
        },
      },
      MuiTextField: { defaultProps: { size: "small", fullWidth: true } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: p.surface,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: p.border },
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: { root: { color: p.muted } },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 18, border: `1px solid ${p.border}` },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontWeight: 800, paddingRight: 56 } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 700, borderRadius: 999 } },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 700, minHeight: 44 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            color: p.muted,
            backgroundColor: p.surface2,
            whiteSpace: "nowrap",
          },
          root: { borderColor: p.border },
        },
      },
      MuiTooltip: { defaultProps: { arrow: true } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
    },
  });
};
