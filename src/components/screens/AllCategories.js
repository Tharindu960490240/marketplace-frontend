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
          message: "Session expired. Please login again.",
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
          message: res.message || "Error loading categories",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error loading categories",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, tabIndex]);

  // ================= ADD =================
  const handleAddCategory = async () => {
    const token = await get_token();

    if (!token) {
      setSnackbar({
        open: true,
        message: "Session expired. Please login again.",
        severity: "error",
      });
      return;
    }

    const value = categoryData.category.trim();

    const isValidCategory = value.length > 0 && /^[A-Za-z\s]+$/.test(value);

    setCategoryData({
      ...categoryData,
      isValidCategory,
    });

    if (!isValidCategory) {
      setSnackbar({
        open: true,
        message: "Please enter a valid category name (letters only).",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await createCategory(token, {
        name: value,
      });

      if (res.success) {
        setSnackbar({
          open: true,
          message: "Category added successfully",
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
          message: res.message || "Error adding category",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Error adding category",
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
        message: "Session expired. Please login again.",
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
          message: "Status updated",
          severity: "success",
        });
        fetchCategories();
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message: res.message || "Error updating status",
          severity: "error",
        });
      }
    } catch (err) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Error updating status",
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
    const isValidCategory = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(val);
    setCategoryData({ ...categoryData, category: val, isValidCategory });
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

    setLoading(true);

    try {
      const res = await deleteCategory(token, deletCategoryId);

      if (res.success) {
        setSnackbar({
          open: true,
          message: "Category deleted successfully.",
          severity: "success",
        });

        // close dialog
        setDeleteDialogOpen(false);
        fetchCategories();
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message: res.message || "Failed to delete category.",
          severity: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Something went wrong. Try again later.",
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

    return <Chip label={status} color={map[status]} size="small" />;
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <>
      <Box className="allCategories-container" p={2}>
        <h2>Category Management</h2>

        <div className="button-group">
          <button onClick={handleModalOpen} className="button-success">
            <Add style={{ marginRight: 5 }} />
            Add New Category
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
          <Tab label="Active" />
          <Tab label="Inactive" />
        </Tabs>

        {/* ACTION BAR */}
        <Box className="allCategories-actions">
          <TextField
            className="custom-textfield"
            size="small"
            label="Search Category"
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
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No categories found
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
                          <Tooltip title="Activate">
                            <IconButton
                              color="secondary"
                              onClick={() => handleToggleStatus(c.id, c.status)}
                            >
                              <ToggleOn color="success" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Inactivate">
                            <IconButton
                              onClick={() => handleToggleStatus(c.id, c.status)}
                            >
                              <ToggleOff color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
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
            style={{ position: "absolute", right: 10, top: 10 }}
          >
            <Close />
          </IconButton>
          <h2 className="modal-title">Add New Category</h2>

          <TextField
            className="custom-textfield"
            size="small"
            label="New Category"
            type="text"
            fullWidth
            margin="normal"
            variant="outlined"
            onChange={(e) => handleCategoryChange(e.target.value)}
            required
            error={!categoryData.isValidCategory}
            helperText={
              !categoryData.isValidCategory ? "Category name is required and must contain only letters" : ""
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
              Save
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="button-error"
            >
              Cancel
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
          Delete Category
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
            Are you sure you want to delete this category? This action cannot be
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
    </>
  );
};

export default AllCategories;
