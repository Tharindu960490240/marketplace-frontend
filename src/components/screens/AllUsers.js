import React, { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  BlockRounded,
  CheckCircleOutline,
  Close,
  ForwardToInboxOutlined,
  PeopleOutline,
  SearchRounded,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/dataTable.css";

import * as AppConst from "../../const/const";
import {
  getAllUsers,
  get_token,
  registerUser,
  updateUserStatus,
} from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotifyContext";
import useDebounce from "../../hooks/useDebounce";
import { shareOrCopy } from "../../utils/share";
import { isEmail, isName, isPhone, isStrongPassword } from "../../utils/validation";
import AdminLayout from "../common/AdminLayout";
import StatusChip from "../common/StatusChip";
import EmptyState from "../common/EmptyState";
import PasswordField from "../common/PasswordField";
import ConfirmDialog from "../common/ConfirmDialog";
import { PasswordRules } from "./SignUp";

const STATUS_TABS = ["active", "pending", "suspended"];

const emptyAdmin = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const AllUsers = () => {
  const { t } = useTranslation();
  const notify = useNotify();
  const { user: me } = useAuth();

  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 450);
  const [sort, setSort] = useState({ field: "created_at", order: "desc" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [suspendUser, setSuspendUser] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [admin, setAdmin] = useState(emptyAdmin);
  const [adminSubmitted, setAdminSubmitted] = useState(false);

  // Changing tab/search/size returns to the first page (tabs didn't before)
  useEffect(() => setPage(0), [debouncedSearch, tab, rowsPerPage, sort]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const token = await get_token();
    const res = await getAllUsers(token, {
      page: page + 1,
      limit: rowsPerPage,
      status: STATUS_TABS[tab],
      search: debouncedSearch,
      sortField: sort.field,
      sortOrder: sort.order,
    });
    if (res.success) {
      setUsers(res.data);
      setTotal(res.total);
    } else {
      notify(t("all_users_page.load_error"), "error");
    }
    setLoading(false);
  }, [page, rowsPerPage, tab, debouncedSearch, sort, notify, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ================= STATUS ================= */
  const changeStatus = async (u, status) => {
    setBusy(true);
    const token = await get_token();
    const res = await updateUserStatus(token, u.id, u.email, status);
    setBusy(false);
    setSuspendUser(null);

    if (res.success) {
      notify(t("all_users_page.status_change_success"));
      fetchUsers();
    } else {
      notify(res.message || t("all_users_page.status_change_error"), "error");
    }
  };

  const toggleSort = (field) =>
    setSort((s) => ({
      field,
      order: s.field === field && s.order === "asc" ? "desc" : "asc",
    }));

  /* ================= REMINDER ================= */
  const sendReminder = async (u) => {
    const url = `${AppConst.FRONTEND_BASE_URL}verify/${u.email_verification_token}`;
    const text = t("all_users_page.reminder_message", { name: u.first_name || "" });
    const result = await shareOrCopy({
      url,
      title: t("all_users_page.share_email_title"),
      text,
    });
    if (result === "copied") notify(t("all_users_page.reminder_copied"));
    if (result === "failed") notify(t("share_component.failed_copy"), "error");
  };

  /* ================= ADD ADMIN ================= */
  const adminErrors = {
    first_name: !isName(admin.first_name),
    last_name: !isName(admin.last_name),
    email: !isEmail(admin.email),
    phone: !isPhone(admin.phone),
    password: !isStrongPassword(admin.password),
    confirmPassword: !admin.confirmPassword || admin.password !== admin.confirmPassword,
  };
  const showAdminError = (f) => adminSubmitted && adminErrors[f];

  const bindAdmin = (field) => ({
    value: admin[field],
    onChange: (e) => setAdmin((a) => ({ ...a, [field]: e.target.value })),
    error: showAdminError(field),
  });

  const closeAdmin = () => {
    setAdminOpen(false);
    setAdmin(emptyAdmin);
    setAdminSubmitted(false);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminSubmitted(true);
    if (Object.values(adminErrors).some(Boolean)) return;

    setBusy(true);
    const res = await registerUser({
      first_name: admin.first_name.trim(),
      last_name: admin.last_name.trim(),
      email: admin.email.trim(),
      phone: admin.phone.trim(),
      password: admin.password,
      role: "admin",
    });
    setBusy(false);

    if (res.success) {
      notify(t("all_users_page.admin_create_success"));
      closeAdmin();
      fetchUsers(); // new admin appears in the list straight away
    } else {
      notify(res.message || t("all_users_page.admin_create_error"), "error");
    }
  };

  const SortIcon = sort.order === "asc" ? ArrowUpwardRounded : ArrowDownwardRounded;

  return (
    <AdminLayout
      title={t("all_users_page.title")}
      subtitle={t("all_users_page.subtitle")}
      actions={
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setAdminOpen(true)}>
          {t("all_users_page.add_admin")}
        </Button>
      }
    >
      <div className="data-card">
        <div className="data-toolbar">
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
            {STATUS_TABS.map((s) => (
              <Tab key={s} label={t(`status.${s}`)} />
            ))}
          </Tabs>
          <TextField
            className="data-search"
            placeholder={t("all_users_page.search_label")}
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

        <Table className="data-table">
          <TableHead>
            <TableRow>
              <TableCell>
                <button className="sort-button" onClick={() => toggleSort("first_name")}>
                  {t("all_users_page.table_name")}
                  {sort.field === "first_name" && <SortIcon />}
                </button>
              </TableCell>
              <TableCell>{t("all_users_page.table_contact")}</TableCell>
              <TableCell>{t("all_users_page.table_role")}</TableCell>
              <TableCell>{t("all_users_page.table_status")}</TableCell>
              <TableCell align="right">{t("all_users_page.table_actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && users.length === 0 && (
              <TableRow className="data-empty">
                <TableCell colSpan={5}>
                  <EmptyState compact icon={<PeopleOutline />} title={t("all_users_page.empty")} />
                </TableCell>
              </TableRow>
            )}

            {users.map((u) => {
              const isSelf = me?.email === u.email;
              return (
                <TableRow key={u.id}>
                  <TableCell className="cell-main">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <Avatar src={u.profile_image || AppConst.PROFILE_PLACEHOLDER_IMAGE} />
                      <div className="cell-title">
                        <strong>
                          {u.first_name} {u.last_name}
                        </strong>
                        <span className="cell-sub">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell data-label={t("all_users_page.table_contact")}>
                    {u.phone ? <a href={`tel:${u.phone}`}>{u.phone}</a> : "—"}
                  </TableCell>
                  <TableCell data-label={t("all_users_page.table_role")}>
                    <span className="role-chip">{t(`roles.${u.role}`, { defaultValue: u.role })}</span>
                  </TableCell>
                  <TableCell data-label={t("all_users_page.table_status")}>
                    <StatusChip status={u.status} />
                  </TableCell>
                  <TableCell>
                    <div className="cell-actions">
                      {u.status === "pending" && u.email_verification_token && (
                        <Tooltip title={t("all_users_page.tooltip_send_reminder")}>
                          <IconButton className="icon-btn" onClick={() => sendReminder(u)}>
                            <ForwardToInboxOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {u.status === "suspended" ? (
                        <Tooltip title={t("all_users_page.tooltip_activate")}>
                          <span>
                            <IconButton
                              className="icon-btn success"
                              disabled={busy}
                              onClick={() => changeStatus(u, "active")}
                            >
                              <CheckCircleOutline fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          title={
                            isSelf
                              ? t("all_users_page.tooltip_self_suspend")
                              : t("all_users_page.tooltip_suspend")
                          }
                        >
                          <span>
                            <IconButton
                              className="icon-btn danger"
                              disabled={isSelf || busy}
                              onClick={() => setSuspendUser(u)}
                            >
                              <BlockRounded fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_e, p) => setPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          labelRowsPerPage={t("common.rows_per_page")}
        />
      </div>

      <ConfirmDialog
        open={!!suspendUser}
        title={t("all_users_page.suspend_title")}
        message={t("all_users_page.suspend_message", {
          name: `${suspendUser?.first_name || ""} ${suspendUser?.last_name || ""}`.trim(),
        })}
        confirmLabel={t("all_users_page.tooltip_suspend")}
        onConfirm={() => changeStatus(suspendUser, "suspended")}
        onClose={() => setSuspendUser(null)}
        busy={busy}
      />

      {/* ================= ADD ADMIN ================= */}
      <Dialog open={adminOpen} onClose={busy ? undefined : closeAdmin} fullWidth maxWidth="sm">
        <form onSubmit={handleCreateAdmin} noValidate>
          <DialogTitle>
            {t("all_users_page.modal_title")}
            <IconButton
              onClick={closeAdmin}
              aria-label={t("common.close")}
              sx={{ position: "absolute", right: 12, top: 12 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="form-grid" style={{ paddingTop: 6 }}>
              <TextField
                label={t("all_users_page.first_name")}
                {...bindAdmin("first_name")}
                helperText={showAdminError("first_name") ? t("all_users_page.first_name_error") : ""}
              />
              <TextField
                label={t("all_users_page.last_name")}
                {...bindAdmin("last_name")}
                helperText={showAdminError("last_name") ? t("all_users_page.last_name_error") : ""}
              />
              <TextField
                label={t("all_users_page.email")}
                type="email"
                {...bindAdmin("email")}
                helperText={showAdminError("email") ? t("all_users_page.email_error") : ""}
              />
              <TextField
                label={t("all_users_page.contact_no")}
                inputMode="numeric"
                {...bindAdmin("phone")}
                onChange={(e) =>
                  setAdmin((a) => ({ ...a, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                }
                helperText={showAdminError("phone") ? t("all_users_page.contact_error") : ""}
              />
              {/* Value is bound to `password` (it was `newPassword`, so typing showed nothing) */}
              <PasswordField
                label={t("all_users_page.new_password")}
                autoComplete="new-password"
                {...bindAdmin("password")}
                helperText={showAdminError("password") ? t("all_users_page.password_error") : ""}
              />
              <PasswordField
                label={t("all_users_page.confirm_password")}
                autoComplete="new-password"
                showToggle={false}
                {...bindAdmin("confirmPassword")}
                helperText={
                  showAdminError("confirmPassword") ? t("all_users_page.confirm_password_error") : ""
                }
              />
              <div className="span-2">
                <PasswordRules value={admin.password} />
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={closeAdmin} disabled={busy}>
              {t("all_users_page.cancel")}
            </Button>
            <Button type="submit" variant="contained" disabled={busy}>
              {t("all_users_page.create_admin")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AdminLayout>
  );
};

export default AllUsers;
