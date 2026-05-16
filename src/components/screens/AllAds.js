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
          message: "Session expired. Please login again.",
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
          message: res.message || "Error loading ads",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error loading ads",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, tabIndex]);

  // ================= NEW: REJECT FUNCTION =================
  const handleReject = async () => {
    const token = await get_token();
    if (!token) {
      setSnackbar({
        open: true,
        message: "Session expired. Please login again.",
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
          message: "Ad rejected successfully",
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
          message: res.message || "Failed to reject ad",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error rejecting ad",
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
        message: "Session expired. Please login again.",
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
          message: "Ad activated successfully",
          severity: "success",
        });
        fetchAds();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to activate ad",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error activating ad",
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
        message: "Session expired. Please login again.",
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
          message: "Ad deleted successfully",
          severity: "success",
        });

        setDeleteDialogOpen(false);
        fetchAds();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Delete failed",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error deleteing ad",
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

    return <Chip label={status} color={map[status]} size="small" />;
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
        <h2>Ads Management</h2>

        {/* SEARCH */}
        <Box className="allAds-actions">
          <TextField
            className="custom-textfield"
            size="small"
            label="Search Ads"
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
          <Tab label="Pending" />
          <Tab label="Active" />
          <Tab label="Sold" />
          <Tab label="Rejected" />
          <Tab label="Deleted" />
        </Tabs>

        {/* TABLE */}
        <Paper sx={{ mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No ads found
                    </TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <img
                          src={
                            ad.primary_image
                              ? AppConst.ADS_PLACEHOLDER_IMAGE +
                                ad.primary_image
                              : AppConst.ADS_PLACEHOLDER_IMAGE +
                                "uploads/profile_pic/user.png"
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
                      <TableCell>
                        {ad.district}, {ad.city}
                      </TableCell>

                      <TableCell>{statusChip(ad.status)}</TableCell>

                      <TableCell>
                        ${Number(ad.price).toLocaleString()}
                      </TableCell>

                      <TableCell>{ad.views_count}</TableCell>

                      <TableCell>
                        {new Date(ad.created_at).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Tooltip title="View Details">
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
                          <Tooltip title="Activate">
                            <IconButton onClick={() => handleActivate(ad.id)}>
                              <ToggleOn color="success" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* ================= NEW: REJECT ================= */}
                        {(ad.status === "pending" ||
                          ad.status === "active") && (
                          <Tooltip title="Reject">
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
                          <Tooltip title="Delete">
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
          Delete Ad
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
            Are you sure you want to delete this ad? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <button
            className="button-success"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </button>

          <button className="button-error" onClick={handleDelete}>
            Delete
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
            style={{ position: "absolute", right: 10, top: 10 }}
          >
            <Close />
          </IconButton>
          <h2 className="modal-title">Reject Ad</h2>

          <div className="form-row full">
            <TextField
              className="custom-textfield"
              label="Reject reason"
              multiline
              rows={4}
              required
              value={rejectData.reason}
              error={!rejectData.isValid}
              helperText={
                !rejectData.isValid
                  ? "Reject reason is required"
                  : "eg: Fake imformations provided "
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
              Reject
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
              Cancel
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
