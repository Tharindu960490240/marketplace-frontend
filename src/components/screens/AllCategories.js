import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  IconButton,
  InputAdornment,
  LinearProgress,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  AddRounded,
  CategoryOutlined,
  DeleteOutline,
  SearchRounded,
  ToggleOffOutlined,
  ToggleOnOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/dataTable.css";

import {
  createCategory,
  deleteCategory,
  getAllCategoriesAdmin,
  updateCategoryStatus,
} from "../../services/categoryService";
import { get_token } from "../../services/authService";
import { useNotify } from "../../context/NotifyContext";
import useDebounce from "../../hooks/useDebounce";
import { formatDate } from "../../utils/format";
import { isText } from "../../utils/validation";
import AdminLayout from "../common/AdminLayout";
import StatusChip from "../common/StatusChip";
import EmptyState from "../common/EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";

const STATUS_TABS = ["active", "inactive"];

const AllCategories = () => {
  const { t, i18n } = useTranslation();
  const notify = useNotify();

  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 450);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [addSubmitted, setAddSubmitted] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => setPage(0), [debouncedSearch, tab, rowsPerPage]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const token = await get_token();
    const res = await getAllCategoriesAdmin(token, {
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch,
      status: STATUS_TABS[tab],
    });
    if (res.success) {
      setCategories(res.data);
      setTotal(res.total);
    } else {
      notify(t("all_categories_page.load_error"), "error");
    }
    setLoading(false);
  }, [page, rowsPerPage, debouncedSearch, tab, notify, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ================= ADD ================= */
  const nameError = addSubmitted && !isText(newName, 2);

  const closeAdd = () => {
    setAddOpen(false);
    setNewName("");
    setAddSubmitted(false);
  };

  const handleAdd = async () => {
    setAddSubmitted(true);
    if (!isText(newName, 2)) return;

    setBusy(true);
    const token = await get_token();
    const res = await createCategory(token, { name: newName.trim() });
    setBusy(false);

    if (res.success) {
      notify(t("all_categories_page.add_success"));
      closeAdd(); // the dialog used to stay open after saving
      fetchCategories();
    } else {
      notify(res.message || t("all_categories_page.add_error"), "error");
    }
  };

  /* ================= STATUS / DELETE ================= */
  const toggleStatus = async (cat) => {
    setBusy(true);
    const token = await get_token();
    const res = await updateCategoryStatus(
      token,
      cat.id,
      cat.status === "active" ? "inactive" : "active",
    );
    setBusy(false);

    if (res.success) {
      notify(t("all_categories_page.status_updated"));
      fetchCategories();
    } else {
      notify(
        res.message || t("all_categories_page.status_update_error"),
        "error",
      );
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    const token = await get_token();
    const res = await deleteCategory(token, deleteId);
    setBusy(false);

    if (res.success) {
      notify(t("all_categories_page.delete_success"));
      setDeleteId(null);
      fetchCategories();
    } else {
      notify(res.message || t("all_categories_page.delete_error"), "error");
    }
  };

  return (
    <AdminLayout
      title={t("all_categories_page.title")}
      subtitle={t("all_categories_page.subtitle")}
      actions={
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setAddOpen(true)}
        >
          {t("all_categories_page.add_new")}
        </Button>
      }
    >
      <div className="data-card">
        <div className="data-toolbar">
          <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
            {STATUS_TABS.map((s) => (
              <Tab key={s} label={t(`status.${s}`)} />
            ))}
          </Tabs>
          <TextField
            className="data-search"
            placeholder={t("all_categories_page.search_label")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {loading && <LinearProgress />}

        <div className="data-scroll">
          <Table className="data-table">
            <TableHead>
              <TableRow>
                <TableCell>{t("all_categories_page.name")}</TableCell>
                <TableCell>{t("all_categories_page.status")}</TableCell>
                <TableCell>{t("all_categories_page.created")}</TableCell>
                <TableCell align="right">
                  {t("all_categories_page.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && categories.length === 0 && (
                <TableRow className="data-empty">
                  <TableCell colSpan={4}>
                    <EmptyState
                      compact
                      icon={<CategoryOutlined />}
                      title={t("all_categories_page.empty")}
                    />
                  </TableCell>
                </TableRow>
              )}

              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="cell-main">
                    <strong>{c.name}</strong>
                  </TableCell>
                  <TableCell data-label={t("all_categories_page.status")}>
                    <StatusChip status={c.status} />
                  </TableCell>
                  <TableCell data-label={t("all_categories_page.created")}>
                    {formatDate(c.created_at, i18n.language)}
                  </TableCell>
                  <TableCell>
                    <div className="cell-actions">
                      <Tooltip
                        title={
                          c.status === "active"
                            ? t("all_categories_page.tooltip_deactivate")
                            : t("all_categories_page.tooltip_activate")
                        }
                      >
                        <span>
                          <IconButton
                            className={`icon-btn ${c.status === "active" ? "" : "success"}`}
                            disabled={busy}
                            onClick={() => toggleStatus(c)}
                          >
                            {c.status === "active" ? (
                              <ToggleOnOutlined
                                fontSize="small"
                                color="success"
                              />
                            ) : (
                              <ToggleOffOutlined fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={t("all_categories_page.tooltip_delete")}>
                        <IconButton
                          className="icon-btn danger"
                          onClick={() => setDeleteId(c.id)}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_e, p) => setPage(p)}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
          labelRowsPerPage={t("common.rows_per_page")}
        />
      </div>

      <ConfirmDialog
        open={addOpen}
        title={t("all_categories_page.modal_title")}
        confirmLabel={t("all_categories_page.save")}
        onConfirm={handleAdd}
        onClose={closeAdd}
        busy={busy}
        danger={false}
      >
        <TextField
          sx={{ mt: 1 }}
          label={t("all_categories_page.modal_input")}
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          error={nameError}
          helperText={nameError ? t("all_categories_page.modal_error") : ""}
          inputProps={{ maxLength: 60 }}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={!!deleteId}
        title={t("all_categories_page.dialog_title")}
        message={t("all_categories_page.dialog_message")}
        confirmLabel={t("all_categories_page.delete")}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        busy={busy}
      />
    </AdminLayout>
  );
};

export default AllCategories;
