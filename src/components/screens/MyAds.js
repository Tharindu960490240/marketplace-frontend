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
} from "@mui/material";

import {
  Search,
  Delete,
  Visibility,
  CheckCircle,
  ToggleOn,
  Close,
} from "@mui/icons-material";

import { getMyAds, updateAdStatus } from "../../services/adsService";
import { get_token } from "../../services/authService";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import "../styles/allAds.css";
import * as AppConst from "../../const/const";

// ================= USER STATUS TABS =================
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

const MyAds = () => {
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ================= FETCH USER ADS =================
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

      const res = await getMyAds(
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

  // ================= MARK AS SOLD (USER ACTION) =================
  const changeStatus = async (id, status) => {
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

      const res = await updateAdStatus(token, id, status);

      if (res.success) {
        setSnackbar({
          open: true,
          message: "Marked as " + status,
          severity: "success",
        });

        fetchAds();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to update",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Server error",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
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

      const res = await updateAdStatus(token, deleteAdId, "deleted");

      if (res.success) {
        setSnackbar({
          open: true,
          message: "Ad deleted",
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
        message: "Error deleting ad",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <Box className="allAds-container">
        <h2>My Ads</h2>

        {/* SEARCH */}
        <Box className="allAds-actions">
          <TextField
            className="custom-textfield"
            size="small"
            label="Search My Ads"
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

        {/* TABS */}
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
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No ads found
                    </TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad) => (
                    <TableRow key={ad.id}>
                      {/* IMAGE */}
                      <TableCell>
                        <img
                          src={
                            ad.primary_image
                              ?
                                ad.primary_image
                              : AppConst.ADS_PLACEHOLDER_IMAGE 
                          }
                          alt=""
                          style={{
                            width: 45,
                            height: 45,
                            borderRadius: 8,
                          }}
                        />
                      </TableCell>

                      <TableCell>{ad.title}</TableCell>

                      <TableCell>{statusChip(ad.status)}</TableCell>

                      <TableCell>
                        Rs. {Number(ad.price).toLocaleString()}
                      </TableCell>

                      <TableCell>{ad.views_count}</TableCell>

                      {/* ACTIONS */}
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton
                            onClick={() =>
                              window.open(`/ad/${ad.id}`, "_blank")
                            }
                          >
                            <Visibility color="primary" />
                          </IconButton>
                        </Tooltip>

                        {/* USER: MARK AS SOLD */}
                        {ad.status === "active" && (
                          <Tooltip title="Mark as Sold">
                            <IconButton
                              onClick={() => changeStatus(ad.id, "sold")}
                            >
                              <CheckCircle color="success" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {ad.status === "sold" && (
                          <Tooltip title="Mark as Active">
                            <IconButton
                              onClick={() => changeStatus(ad.id, "active")}
                            >
                              <ToggleOn color="success" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {(ad.status === "pending" ||
                          ad.status === "active" ||
                          ad.status === "sold") && (
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

      {/* DELETE DIALOG */}
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

      <LoadingSpinner open={loading} />
      <CustomSnackbar {...snackbar} onClose={handleClose} />
    </>
  );
};

export default MyAds;
