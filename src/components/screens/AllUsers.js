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
  Avatar,
  Tooltip,
  Modal,
} from "@mui/material";

import {
  Search,
  Block,
  CheckCircle,
  ArrowUpward,
  ArrowDownward,
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  Add,
  Close,
  Message,
} from "@mui/icons-material";

import {
  getAllUsers,
  get_token,
  updateUserStatus,
  getMyData,
  registerUser,
} from "../../services/authService";
import * as AppConst from "../../const/const";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import "../styles/allUsers.css";

import { useTranslation } from "react-i18next";

const statusTabs = ["active", "pending", "suspended"];

// ================= DEBOUNCE =================
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

const AllUsers = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(false);

  const [myData, setMyData] = useState([null]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handle Snackbar Close
  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ================= FETCH =================
  const fetchUsers = useCallback(async () => {
    try {
      const token = await get_token();
      const myData = await getMyData();

      setMyData(myData);

      setLoading(true);

      const res = await getAllUsers(token, {
        page: page + 1,
        limit: rowsPerPage,
        status: statusTabs[tabIndex],
        search: debouncedSearch,
        sortField,
        sortOrder,
      });

      if (res.success) {
        setUsers(res.data);
        setTotal(res.total);
      } else {
        setSnackbar({
          open: true,
          message: t("all_users_page.load_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("all_users_page.load_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, tabIndex, debouncedSearch, sortField, sortOrder, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ================= ACTIONS =================
  const handleStatusChange = async (userId, email, status) => {
    try {
      const token = await get_token();
      setLoading(true);

      const res = await updateUserStatus(token, userId, email, status);

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("all_users_page.status_change_success"),
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: t("all_users_page.status_change_error"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("all_users_page.status_change_server_error"),
        severity: "error",
      });
    } finally {
      fetchUsers();
    }
  };

  // ================= SORT =================
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  // ================= CHIP =================
  const statusChip = (status) => {
    const map = {
      active: "success",
      pending: "warning",
      suspended: "error",
    };

    return (
      <Chip
        label={t(`all_users_page.status_${status}`)}
        color={map[status]}
        size="small"
      />
    );
  };
  // Add Admin Modal Logic

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  const [adminData, setAdminData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    showPassword: false,
    isValidFirstName: true,
    isValidLastName: true,
    isValidEmail: true,
    isValidContactNo: true,
    isValidPassword: true,
    passwordMatch: true,
  });

  const handleAddAdminModalOpen = () => {
    setAdminData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      showPassword: false,
      isValidFirstName: true,
      isValidLastName: true,
      isValidEmail: true,
      isValidContactNo: true,
      isValidPassword: true,
      passwordMatch: true,
    });
    setShowAddAdminModal(true);
  };

  const handleAdminChange = (field, value) => {
    let update = { [field]: value };

    switch (field) {
      case "first_name":
        update.isValidFirstName = /^[a-zA-Z]+$/.test(value);
        break;
      case "last_name":
        update.isValidLastName = /^[a-zA-Z]+$/.test(value);
        break;
      case "email":
        update.isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case "phone":
        update.isValidContactNo = /^\d{10}$/.test(value);
        break;
      case "password":
        update.isValidPassword =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value,
          );
        update.passwordMatch = value === adminData.confirmPassword;
        break;
      case "confirmPassword":
        update.passwordMatch = value === adminData.password;
        break;
      default:
        break;
    }

    setAdminData({ ...adminData, ...update });
  };

  const handleAdminFormSubmit = async () => {
    const isFirstNameValid =
      /^[a-zA-Z]+$/.test(adminData.first_name) &&
      adminData.first_name.length > 0;
    const isLastNameValid =
      /^[a-zA-Z]+$/.test(adminData.last_name) && adminData.last_name.length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email);
    const isContactNoValid = /^\d{10}$/.test(adminData.phone);
    const isPasswordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        adminData.password,
      );
    const matchPassword = adminData.password === adminData.confirmPassword;

    // Update the state with validation results
    setAdminData({
      ...adminData,
      isValidFirstName: isFirstNameValid,
      isValidLastName: isLastNameValid,
      isValidEmail: isEmailValid,
      isValidContactNo: isContactNoValid,
      isValidPassword: isPasswordValid,
      passwordMatch: matchPassword,
      role: "admin",
    });

    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isEmailValid ||
      !isContactNoValid ||
      !isPasswordValid ||
      !matchPassword
    ) {
      setSnackbar({
        open: true,
        message: t("all_users_page.validation_error"),
        severity: "error",
      });
      return;
    }

    setLoading(true);

    // Proceed with admin creation if all validations pass
    try {
      const result = await registerUser(adminData);
      if (result.success) {
        setSnackbar({
          open: true,
          message: t("all_users_page.admin_create_success"),
          severity: "success",
        });
        setTimeout(() => {
          setShowAddAdminModal(false);
          setLoading(false);
        }, 2500);
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message: t("all_users_page.admin_create_error"),
          severity: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: t("all_users_page.admin_create_server_error"),
        severity: "error",
      });
    }
  };

  const sendReminder = async (e, user) => {
    e.stopPropagation();

    const shareUrl = `${AppConst.FRONTEND_BASE_URL}/verify/${user.email_verification_token}`;
    const shareTitle = t("all_users_page.share_email_title");

    // The bilingual message
    const reminderMessage = `Hi ${user.first_name || ""},

We noticed you haven't activated your account on Agri Link Services Marketplace yet. 
Agri Link Services Marketplace හි ඔබගේ ගිණුම තවමත් සක්‍රිය කර නොමැති බව අපට දන්වන්නට අවශ්‍යයි.

Please click the link below to verify your account and start exploring:
ඔබගේ ගිණුම සක්‍රිය කර අපගේ සේවාවන් භාවිත කිරීමට කරුණාකර පහත සබැඳිය ක්ලික් කරන්න:

Thank you / ස්තුතියි,
The Agri Link Team
`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: reminderMessage,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error.name !== "AbortError") {
          setSnackbar({
            open: true,
            severity: "error",
            message: t("share_component.error"),
          });
        }
        return;
      }
    }

    // 3. Try Modern Clipboard API Fallback
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setSnackbar({
          open: true,
          severity: "success",
          message: t("share_component.copied"),
        });
        return;
      } catch (err) {
        /* silent fail */
      }
    }

    // 4. Robust Legacy Textarea Fallback
    try {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setSnackbar({
          open: true,
          severity: "success",
          message: t("share_component.copied"),
        });
      } else {
        throw new Error("Copy command execution failed.");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: t("share_component.failed_copy"),
      });
    }
  };

  return (
    <>
      <Box className="allUsers-container" p={2}>
        <h2>{t("all_users_page.title")}</h2>

        <div className="button-group">
          <button onClick={handleAddAdminModalOpen} className="button-success">
            <Add style={{ marginRight: 5 }} />
            {t("all_users_page.add_admin")}
          </button>
        </div>

        {/* TABS */}
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
        >
          <Tab label={t("all_users_page.tab_active")} />
          <Tab label={t("all_users_page.tab_pending")} />
          <Tab label={t("all_users_page.tab_suspended")} />
        </Tabs>

        {/* SEARCH + EXPORT */}
        <Box className="allUsers-actions">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("all_users_page.search_label")}
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
                  <TableCell>{t("all_users_page.table_avatar")}</TableCell>

                  <TableCell onClick={() => handleSort("first_name")}>
                    {t("all_users_page.table_name")}{" "}
                    {sortField === "first_name" ? (
                      sortOrder === "asc" ? (
                        <ArrowUpward />
                      ) : (
                        <ArrowDownward />
                      )
                    ) : (
                      <ArrowDownward style={{ opacity: 0.3 }} />
                    )}
                  </TableCell>
                  <TableCell>{t("all_users_page.table_email")}</TableCell>
                  <TableCell>{t("all_users_page.table_contact")}</TableCell>
                  <TableCell>{t("all_users_page.table_role")}</TableCell>
                  <TableCell>{t("all_users_page.table_status")}</TableCell>
                  <TableCell>{t("all_users_page.table_actions")}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {t("all_users_page.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Avatar
                          src={
                            u.profile_image
                              ? u.profile_image
                              : AppConst.PROFILE_PLACEHOLDER_IMAGE
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {u.first_name} {u.last_name}
                      </TableCell>

                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{statusChip(u.status)}</TableCell>

                      <TableCell>
                        {u.status !== "suspended" ? (
                          <Tooltip
                            title={
                              myData?.email === u.email
                                ? t("all_users_page.tooltip_self_suspend")
                                : t("all_users_page.tooltip_suspend")
                            }
                          >
                            <span>
                              <IconButton
                                disabled={myData?.email === u.email}
                                color="secondary"
                                onClick={() =>
                                  handleStatusChange(u.id, u.email, "suspended")
                                }
                              >
                                <Block color="error" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title={t("all_users_page.tooltip_activate")}>
                            <IconButton
                              onClick={() =>
                                handleStatusChange(u.id, u.email, "active")
                              }
                            >
                              <CheckCircle color="success" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {u.status === "pending" && (
                          <Tooltip
                            title={t("all_users_page.tooltip_send_reminder")}
                          >
                            <IconButton onClick={(e) => sendReminder(e, u)}>
                              <Message color="info" />
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

      {/* Add Admin Modal */}
      <Modal open={showAddAdminModal}>
        <div className="add-admin-modal">
          <IconButton
            onClick={() => setShowAddAdminModal(false)}
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              color: "var(--muted-color)",
            }}
          >
            <Close />
          </IconButton>
          <h2 className="modal-title">{t("all_users_page.modal_title")}</h2>
          <div className="form-row-modal">
            <div className="input-container">
              <TextField
                className="custom-textfield"
                size="small"
                label={t("all_users_page.first_name")}
                value={adminData.first_name}
                onChange={(e) =>
                  handleAdminChange("first_name", e.target.value)
                }
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidFirstName}
                helperText={
                  !adminData.isValidFirstName
                    ? t("all_users_page.first_name_error")
                    : ""
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div className="input-container">
              <TextField
                className="custom-textfield"
                size="small"
                label={t("all_users_page.last_name")}
                value={adminData.last_name}
                onChange={(e) => handleAdminChange("last_name", e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidLastName}
                helperText={
                  !adminData.isValidLastName
                    ? t("all_users_page.last_name_error")
                    : ""
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </div>

          <div className="form-row-modal">
            <div className="input-container">
              <TextField
                className="custom-textfield"
                size="small"
                label={t("all_users_page.email")}
                value={adminData.email}
                onChange={(e) => handleAdminChange("email", e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidEmail}
                required
                helperText={
                  !adminData.isValidEmail ? t("all_users_page.email_error") : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                  // endAdornment: adminData.isValidEmail ? (
                  //   <InputAdornment position="end">
                  //     <span style={{ color: "green" }}>✔</span>
                  //   </InputAdornment>
                  // ) : null,
                }}
              />
            </div>

            <div className="input-container">
              <TextField
                className="custom-textfield"
                size="small"
                label={t("all_users_page.contact_no")}
                value={adminData.phone}
                onChange={(e) => handleAdminChange("phone", e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidContactNo}
                helperText={
                  !adminData.isValidContactNo
                    ? t("all_users_page.contact_error")
                    : ""
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </div>

          <div className="form-row-modal">
            <div className="input-container">
              <TextField
                className="custom-textfield"
                size="small"
                label={t("all_users_page.new_password")}
                type={adminData.showPassword ? "text" : "password"}
                value={adminData.newPassword}
                onChange={(e) => handleAdminChange("password", e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidPassword}
                helperText={
                  !adminData.isValidPassword
                    ? t("all_users_page.password_error")
                    : ""
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          handleAdminChange(
                            "showPassword",
                            !adminData.showPassword,
                          )
                        }
                      >
                        {adminData.showPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="input-container">
              <TextField
                size="small"
                className="custom-textfield"
                label={t("all_users_page.confirm_password")}
                type={adminData.showPassword ? "text" : "password"}
                value={adminData.confirmPassword}
                onChange={(e) =>
                  handleAdminChange("confirmPassword", e.target.value)
                }
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.passwordMatch}
                helperText={
                  !adminData.passwordMatch
                    ? t("all_users_page.confirm_password_error")
                    : ""
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </div>

          <div className="button-group">
            <button onClick={handleAdminFormSubmit} className="button-success">
              {t("all_users_page.save")}
            </button>

            <button
              onClick={() => setShowAddAdminModal(false)}
              className="button-error"
            >
              {t("all_users_page.cancel")}
            </button>
          </div>
        </div>
      </Modal>

      <LoadingSpinner open={loading} />

      <CustomSnackbar {...snackbar} onClose={handleClose} />
    </>
  );
};

export default AllUsers;
