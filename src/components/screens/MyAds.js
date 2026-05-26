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

import { useTranslation } from "react-i18next";

import ShareButton from "./ShareButton";

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
          message: t("my_ads_page.session_expired"),
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
          message: t("my_ads_page.load_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("my_ads_page.server_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, tabIndex, t]);

  // ================= MARK AS SOLD (USER ACTION) =================
  const changeStatus = async (id, status) => {
    const token = await get_token();
    if (!token) {
      setSnackbar({
        open: true,
        message: t("my_ads_page.session_expired"),
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
          message: t("my_ads_page.marked_as") + " " + status,
          severity: "success",
        });

        fetchAds();
      } else {
        setSnackbar({
          open: true,
          message: t("my_ads_page.update_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("my_ads_page.server_error"),
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
        message: t("my_ads_page.session_expired"),
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
          message: t("my_ads_page.delete_success"),
          severity: "success",
        });

        setDeleteDialogOpen(false);
        fetchAds();
      } else {
        setSnackbar({
          open: true,
          message: t("my_ads_page.delete_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("my_ads_page.server_error"),
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

    return (
      <Chip
        label={t(`my_ads_page.status_${status}`)}
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

  return (
    <>
      <Box className="allAds-container">
        <h2>{t("my_ads_page.title")}</h2>

        {/* SEARCH */}
        <Box className="allAds-actions">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("my_ads_page.search_label")}
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
          <Tab label={t("my_ads_page.tab_pending")} />
          <Tab label={t("my_ads_page.tab_active")} />
          <Tab label={t("my_ads_page.tab_sold")} />
          <Tab label={t("my_ads_page.tab_rejected")} />
          <Tab label={t("my_ads_page.tab_deleted")} />
        </Tabs>

        {/* TABLE */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("my_ads_page.table_image")}</TableCell>
                  <TableCell>{t("my_ads_page.table_title")}</TableCell>
                  <TableCell>{t("my_ads_page.table_category")}</TableCell>
                  <TableCell>{t("my_ads_page.table_sub_category")}</TableCell>
                  <TableCell>{t("my_ads_page.table_status")}</TableCell>
                  <TableCell>{t("my_ads_page.table_price")}</TableCell>
                  <TableCell>{t("my_ads_page.table_views")}</TableCell>
                  <TableCell>{t("my_ads_page.table_actions")}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {t("my_ads_page.empty")}
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
                              ? ad.primary_image
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
                      <TableCell>{ad.category?.name || "-"}</TableCell>
                      <TableCell>{ad.sub_category}</TableCell>
                      <TableCell>{statusChip(ad.status)}</TableCell>

                      <TableCell>
                        Rs. {Number(ad.price).toLocaleString()}
                      </TableCell>

                      <TableCell>{ad.views_count}</TableCell>

                      {/* ACTIONS */}
                      <TableCell>
                        <Tooltip title={t("my_ads_page.tooltip_view")}>
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
                          <Tooltip title={t("my_ads_page.tooltip_mark_sold")}>
                            <IconButton
                              onClick={() => changeStatus(ad.id, "sold")}
                            >
                              <CheckCircle color="success" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {ad.status === "sold" && (
                          <Tooltip title={t("my_ads_page.tooltip_mark_active")}>
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
                          <Tooltip title={t("my_ads_page.tooltip_delete")}>
                            <IconButton onClick={() => openDelete(ad.id)}>
                              <Delete color="error" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {ad.status === "active" && (
                          <ShareButton
                            url={`${window.location.origin}/ad/${ad.id}`}
                            title={ad.title}
                          />
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
          {t("my_ads_page.dialog_title")}
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
            {t("my_ads_page.dialog_message")}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <button
            className="button-success"
            onClick={() => setDeleteDialogOpen(false)}
          >
            {t("my_ads_page.cancel")}
          </button>

          <button className="button-error" onClick={handleDelete}>
            {t("my_ads_page.delete")}
          </button>
        </DialogActions>
      </Dialog>

      <LoadingSpinner open={loading} />
      <CustomSnackbar {...snackbar} onClose={handleClose} />
    </>
  );
};

export default MyAds;
