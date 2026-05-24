import React, { useEffect, useState, useCallback } from "react";
import {
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Modal,
} from "@mui/material";

import {
  Search,
  Delete,
  Visibility,
  Close,
  ToggleOn,
  Description,
} from "@mui/icons-material";

import { getAds, updateAdStatus } from "../../services/adsService";

import { get_token } from "../../services/authService";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import "../styles/allAds.css";

import * as AppConst from "../../const/const";

import { useTranslation } from "react-i18next";

// ================= UPDATED ONLY: ADD REJECT TAB =================
const statusTabs = ["pending", "active", "sold", "rejected", "deleted"];

// ================= DEBOUNCE =================
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

const AllAds = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAdId, setDeleteAdId] = useState(null);

  const [rejectData, setRejectData] = useState({
    open: false,
    reason: "",
    id: null,
    isValid: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ================= FETCH ADS (NO CHANGE) =================
  const fetchAds = useCallback(async () => {
    try {
      const token = await get_token();
      if (!token) {
        setSnackbar({
          open: true,
          message: t("all_ads_page.session_expired"),
          severity: "error",
        });
        return;
      }

      setLoading(true);

      const res = await getAds(
        {
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
          status: statusTabs[tabIndex],
        },
        token,
      );

      if (res.success) {
        setAds(res.data);
        setTotal(res.total);
      } else {
        setSnackbar({
          open: true,
          message: t("all_ads_page.load_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("all_ads_page.load_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, tabIndex, t]);

  // ================= NEW: REJECT FUNCTION =================
  const handleReject = async () => {
    const token = await get_token();
    if (!token) {
      setSnackbar({
        open: true,
        message: t("all_ads_page.session_expired"),
        severity: "error",
      });
      return;
    }

    const isValid = rejectData.reason.trim().length > 0;
    setRejectData((prev) => ({
      ...prev,
      isValid,
    }));

    if (!isValid) {
      setSnackbar({
        open: true,
        message: t("all_ads_page.reject_reason_required"),
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await updateAdStatus(
        token,
        rejectData.id,
        "rejected",
        rejectData.reason,
      );

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("all_ads_page.reject_success"),
          severity: "success",
        });

        fetchAds();
        setRejectData((prev) => ({
          ...prev,
          open: false,
          id: null,
          reason: "",
          isValid: true,
        }));
      } else {
        setSnackbar({
          open: true,
          message: t("all_ads_page.reject_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("all_ads_page.reject_server_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= ACTIVATE AD (UNCHANGED) =================
  const handleActivate = async (id) => {
    const token = await get_token();
    if (!token) {
      setSnackbar({
        open: true,
        message: t("all_ads_page.session_expired"),
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await updateAdStatus(token, id, "active", null);

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("all_ads_page.activate_success"),
          severity: "success",
        });
        fetchAds();
      } else {
        setSnackbar({
          open: true,
          message: t("all_ads_page.activate_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("all_ads_page.activate_server_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = await get_token();
    if (!token) {
      setSnackbar({
        open: true,
        message: t("all_ads_page.session_expired"),
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await updateAdStatus(token, deleteAdId, "deleted", null);

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("all_ads_page.delete_success"),
          severity: "success",
        });

        setDeleteDialogOpen(false);
        fetchAds();
      } else {
        setSnackbar({
          open: true,
          message: t("all_ads_page.delete_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("all_ads_page.delete_server_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE AD (UNCHANGED) =================
  // const handleDelete = async () => {
  //   const token = await get_token();
  //   if (!token) return;

  //   try {
  //     setLoading(true);

  //     const res = await deleteAd(token, deleteAdId);

  //     if (res.success) {
  //       setSnackbar({
  //         open: true,
  //         message: "Ad deleted successfully",
  //         severity: "success",
  //       });

  //       setDeleteDialogOpen(false);
  //       fetchAds();
  //     } else {
  //       setSnackbar({
  //         open: true,
  //         message: res.message || "Delete failed",
  //         severity: "error",
  //       });
  //     }
  //   } catch (err) {
  //     setSnackbar({
  //       open: true,
  //       message: "Error deleteing ad",
  //       severity: "error",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const statusChip = (status) => {
    const map = {
      pending: "warning",
      active: "success",
      sold: "info",
      rejected: "warning",
      deleted: "error",
    };

    return (
      <Chip
        label={t(`all_ads_page.status_${status}`)}
        color={map[status]}
        size="small"
      />
    );
  };

  const openDelete = (id) => {
    setDeleteAdId(id);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const validateReason = (val) => {
    const isValid = val.trim().length > 0;
    setRejectData((prev) => ({
      ...prev,
      isValid,
      reason: val,
    }));

    return isValid;
  };

  return (
    <>
      <Box className="allAds-container" p={2}>
        <h2>{t("all_ads_page.title")}</h2>

        {/* SEARCH */}
        <Box className="allAds-actions">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("all_ads_page.search_label")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* ================= UPDATED: ADD REJECT TAB ================= */}
        <Tabs
          value={tabIndex}
          onChange={(e, v) => {
            setTabIndex(v);
            setPage(0);
          }}
        >
          <Tab label={t("all_ads_page.tab_pending")} />
          <Tab label={t("all_ads_page.tab_active")} />
          <Tab label={t("all_ads_page.tab_sold")} />
          <Tab label={t("all_ads_page.tab_rejected")} />
          <Tab label={t("all_ads_page.tab_deleted")} />
        </Tabs>

        {/* TABLE */}
        <Paper sx={{ mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("all_ads_page.table_image")}</TableCell>
                  <TableCell>{t("all_ads_page.table_title")}</TableCell>
                  <TableCell>{t("all_ads_page.table_category")}</TableCell>
                  <TableCell>{t("all_ads_page.table_sub_category")}</TableCell>
                  <TableCell>{t("all_ads_page.table_location")}</TableCell>
                  <TableCell>{t("all_ads_page.table_status")}</TableCell>
                  <TableCell>{t("all_ads_page.table_price")}</TableCell>
                  <TableCell>{t("all_ads_page.table_views")}</TableCell>
                  <TableCell>{t("all_ads_page.table_created")}</TableCell>
                  <TableCell>{t("all_ads_page.table_actions")}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      {t("all_ads_page.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <img
                          src={
                            ad.primary_image
                              ? ad.primary_image
                              : AppConst.ADS_PLACEHOLDER_IMAGE
                          }
                          alt={ad.title}
                          style={{
                            width: 45,
                            height: 45,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />
                      </TableCell>

                      <TableCell>{ad.title}</TableCell>
                      <TableCell>{ad.category?.name || "-"}</TableCell>
                      <TableCell>{ad.sub_category}</TableCell>
                      <TableCell>
                        {ad.district}, {ad.city}
                      </TableCell>

                      <TableCell>{statusChip(ad.status)}</TableCell>

                      <TableCell>
                        Rs. {Number(ad.price).toLocaleString()}
                      </TableCell>

                      <TableCell>{ad.views_count}</TableCell>

                      <TableCell>
                        {new Date(ad.created_at).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Tooltip title={t("all_ads_page.tooltip_view")}>
                          <IconButton
                            onClick={() =>
                              window.open(`/ad/${ad.id}`, "_blank")
                            }
                          >
                            <Visibility color="primary" />
                          </IconButton>
                        </Tooltip>

                        {/* ACTIVATE */}
                        {ad.status === "pending" && (
                          <Tooltip title={t("all_ads_page.tooltip_activate")}>
                            <IconButton onClick={() => handleActivate(ad.id)}>
                              <ToggleOn color="success" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* ================= NEW: REJECT ================= */}
                        {(ad.status === "pending" ||
                          ad.status === "active") && (
                          <Tooltip title={t("all_ads_page.tooltip_reject")}>
                            <IconButton
                              onClick={() =>
                                setRejectData((prev) => ({
                                  ...prev,
                                  open: true,
                                  id: ad.id,
                                  reason: "",
                                  isValid: true,
                                }))
                              }
                            >
                              <Close color="warning" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {ad.status !== "deleted" && (
                          <Tooltip title={t("all_ads_page.tooltip_delete")}>
                            <IconButton onClick={() => openDelete(ad.id)}>
                              <Delete color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      </Box>

      {/* DELETE DIALOG (UNCHANGED) */}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-category-dialog-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-category-dialog-title">
          {t("all_ads_page.dialog_title")}
          <IconButton
            aria-label="close"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <DialogContentText>
            {t("all_ads_page.dialog_message")}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <button
            className="button-success"
            onClick={() => setDeleteDialogOpen(false)}
          >
            {t("all_ads_page.cancel")}
          </button>

          <button className="button-error" onClick={handleDelete}>
            {t("all_ads_page.delete")}
          </button>
        </DialogActions>
      </Dialog>

      <Modal open={rejectData.open}>
        <div className="reject-modal">
          <IconButton
            onClick={() =>
              setRejectData((prev) => ({
                ...prev,
                open: false,
                id: null,
                reason: "",
                isValid: true,
              }))
            }
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              color: "var(--muted-color)",
            }}
          >
            <Close />
          </IconButton>
          <h2 className="modal-title">
            {" "}
            {t("all_ads_page.reject_modal_title")}
          </h2>

          <div className="form-row full">
            <TextField
              className="custom-textfield"
              label={t("all_ads_page.reject_reason")}
              multiline
              rows={4}
              required
              value={rejectData.reason}
              error={!rejectData.isValid}
              helperText={
                !rejectData.isValid
                  ? t("all_ads_page.reject_reason_required")
                  : t("all_ads_page.reject_reason_helper")
              }
              onChange={(e) => {
                validateReason(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className="button-group">
            <button onClick={handleReject} className="button-success">
              {t("all_ads_page.reject_button")}
            </button>

            <button
              onClick={() =>
                setRejectData((prev) => ({
                  ...prev,
                  open: false,
                  id: null,
                  reason: "",
                  isValid: true,
                }))
              }
              className="button-error"
            >
              {t("all_ads_page.cancel")}
            </button>
          </div>
        </div>
      </Modal>

      <LoadingSpinner open={loading} />
      <CustomSnackbar {...snackbar} onClose={handleClose} />
    </>
  );
};

export default AllAds;
