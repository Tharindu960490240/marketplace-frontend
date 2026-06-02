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
  Modal,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import {
  Search,
  ToggleOn,
  ToggleOff,
  Add,
  Category,
  Close,
  Delete,
} from "@mui/icons-material";

import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../../services/categoryService";

import { get_token } from "../../services/authService";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import "../styles/allCategories.css";

import { useTranslation } from "react-i18next";

// ================= TABS =================
const statusTabs = ["active", "inactive"];

// ================= DEBOUNCE =================
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

const AllCategories = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletCategoryId, setDeleteCategoryId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ================= FETCH =================
  const fetchCategories = useCallback(async () => {
    try {
      const token = await get_token();

      if (!token) {
        setSnackbar({
          open: true,
          message: t("all_categories_page.session_expired"),
          severity: "error",
        });
        return;
      }
      setLoading(true);

      const res = await getAllCategoriesAdmin(token, {
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        status: statusTabs[tabIndex],
      });

      if (res.success) {
        setCategories(res.data);
        setTotal(res.total);
      } else {
        setSnackbar({
          open: true,
          message: t("all_categories_page.load_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("all_categories_page.load_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, tabIndex, t]);

  // ================= ADD =================
  const handleAddCategory = async () => {
    const token = await get_token();

    if (!token) {
      setSnackbar({
        open: true,
        message: t("all_categories_page.session_expired"),
        severity: "error",
      });
      return;
    }

    const isValidCategory = /^[A-Za-z\u0D80-\u0DFF\p{L}\s\-()]+$/u.test(
      categoryData.category,
    );

    setCategoryData({
      ...categoryData,
      isValidCategory,
    });

    if (!isValidCategory) {
      setSnackbar({
        open: true,
        message: t("all_categories_page.invalid_name"),
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await createCategory(token, {
        name: categoryData.category,
      });

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("all_categories_page.add_success"),
          severity: "success",
        });

        setCategoryData({
          category: "",
          isValidCategory: true,
        });

        fetchCategories();
      } else {
        setSnackbar({
          open: true,
          message: t("all_categories_page.add_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("all_categories_page.add_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS TOGGLE =================
  const handleToggleStatus = async (id, current) => {
    const token = await get_token();

    if (!token) {
      setSnackbar({
        open: true,
        message: t("all_categories_page.session_expired"),
        severity: "error",
      });
      return;
    }

    setLoading(true);
    const newStatus = current === "active" ? "inactive" : "active";

    try {
      const res = await updateCategoryStatus(token, id, newStatus);
      if (res.success) {
        setSnackbar({
          open: true,
          message: t("all_categories_page.status_updated"),
          severity: "success",
        });
        fetchCategories();
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message: t("all_categories_page.status_update_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: t("all_categories_page.status_update_error"),
        severity: "error",
      });
    }
  };

  const [showModal, setShowModal] = useState(false);

  const [categoryData, setCategoryData] = useState({
    category: "",
    isValidCategory: true,
  });

  // Reset Password Modal Logic
  const handleModalOpen = () => {
    setCategoryData({
      category: "",
      isValidCategory: true,
    });
    setShowModal(true);
  };

  const handleCategoryChange = (val) => {
    const isValidCategory = /^[A-Za-z\u0D80-\u0DFF\p{L}\s\-()]+$/u.test(val);
    setCategoryData({ ...categoryData, category: val, isValidCategory });
  };

  const handleDelete = async () => {
    const token = await get_token();

    if (!token) {
      setSnackbar({
        open: true,
        message: t("all_categories_page.session_expired"),
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await deleteCategory(token, deletCategoryId);

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("all_categories_page.delete_success"),
          severity: "success",
        });

        // close dialog
        setDeleteDialogOpen(false);
        fetchCategories();
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message: t("all_categories_page.delete_error"),
          severity: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: t("all_categories_page.delete_error"),
        severity: "error",
      });
    } finally {
    }
  };

  const deleteDialogOpenCategory = (id) => {
    setDeleteCategoryId(id);
    setDeleteDialogOpen(true);
  };

  const statusChip = (status) => {
    const map = {
      active: "success",
      inactive: "error",
    };

    const label =
      status === "active"
        ? t("all_categories_page.status_active")
        : t("all_categories_page.status_inactive");

    return <Chip label={label} color={map[status]} size="small" />;
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <>
      <Box className="allCategories-container" p={2}>
        <h2>{t("all_categories_page.title")}</h2>

        <div className="button-group">
          <button onClick={handleModalOpen} className="button-success">
            <Add style={{ marginRight: 5 }} />
            {t("all_categories_page.add_new")}
          </button>
        </div>
        {/*  TABS (NEW) */}
        <Tabs
          value={tabIndex}
          onChange={(e, v) => {
            setTabIndex(v);
            setPage(0);
          }}
        >
          <Tab label={t("all_categories_page.tab_active")} />
          <Tab label={t("all_categories_page.tab_inactive")} />
        </Tabs>

        {/* ACTION BAR */}
        <Box className="allCategories-actions">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("all_categories_page.search_label")}
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

        {/* TABLE */}
        <Paper sx={{ mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("all_categories_page.name")}</TableCell>
                  <TableCell>{t("all_categories_page.status")}</TableCell>
                  <TableCell>{t("all_categories_page.created")}</TableCell>
                  <TableCell>{t("all_categories_page.actions")}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {t("all_categories_page.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{statusChip(c.status)}</TableCell>
                      <TableCell>
                        {new Date(c.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {c.status !== "active" ? (
                          <Tooltip
                            title={t("all_categories_page.tooltip_activate")}
                          >
                            <IconButton
                              color="secondary"
                              onClick={() => handleToggleStatus(c.id, c.status)}
                            >
                              <ToggleOn color="success" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={t("all_categories_page.tooltip_deactivate")}
                          >
                            <IconButton
                              onClick={() => handleToggleStatus(c.id, c.status)}
                            >
                              <ToggleOff color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip
                          title={t("all_categories_page.tooltip_delete")}
                        >
                          <IconButton
                            color="secondary"
                            onClick={() => deleteDialogOpenCategory(c.id)}
                          >
                            <Delete color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
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

      <Modal open={showModal}>
        <div className="add-category-modal">
          <IconButton
            onClick={() => setShowModal(false)}
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
            {t("all_categories_page.modal_title")}
          </h2>

          <TextField
            className="custom-textfield"
            size="small"
            label={t("all_categories_page.modal_input")}
            type="text"
            fullWidth
            margin="normal"
            variant="outlined"
            onChange={(e) => handleCategoryChange(e.target.value)}
            required
            error={!categoryData.isValidCategory}
            helperText={
              !categoryData.isValidCategory
                ? t("all_categories_page.modal_error")
                : ""
            }
            value={categoryData.category}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Category />
                </InputAdornment>
              ),
            }}
          />

          <div className="button-group">
            <button onClick={handleAddCategory} className="button-success">
              {t("all_categories_page.save")}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="button-error"
            >
              {t("all_categories_page.cancel")}
            </button>
          </div>
        </div>
      </Modal>

      <LoadingSpinner open={loading} />
      <CustomSnackbar {...snackbar} onClose={handleClose} />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-category-dialog-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-category-dialog-title">
          {t("all_categories_page.dialog_title")}
          <IconButton
            aria-label="close"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "var(--muted-color)",
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <DialogContentText>
            {t("all_categories_page.dialog_message")}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <button
            className="button-success"
            onClick={() => setDeleteDialogOpen(false)}
          >
            {t("all_categories_page.cancel")}
          </button>

          <button className="button-error" onClick={handleDelete}>
            {t("all_categories_page.delete")}
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AllCategories;
