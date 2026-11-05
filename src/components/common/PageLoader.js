import React from "react";
import { CircularProgress } from "@mui/material";

const PageLoader = ({ minHeight = 320 }) => (
  <div className="page-loader" style={{ minHeight }} role="status">
    <CircularProgress size={34} />
  </div>
);

export default PageLoader;
