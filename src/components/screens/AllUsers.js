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
          message: res.message || "Error loading users",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error loading users",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, tabIndex, debouncedSearch, sortField, sortOrder]);

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
          message: "Status changes successfully",
          severity: "success",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error loading users",
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

    return <Chip label={status} color={map[status]} size="small" />;
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
        update.isValidPassword = value.length >= 6;
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
    const isPasswordValid = adminData.password.length >= 6;
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
        message: "Please fill in all the fields with valid information.",
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
          message: "Admin account created successfully! Verify email to login.",
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
          message:
            result.message ||
            "Failed to create admin account. Please try again.",
          severity: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "An error occurred while adding the admin. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Box className="allUsers-container" p={2}>
        <h2>User Management</h2>

        <div className="button-group">
          <button onClick={handleAddAdminModalOpen} className="button-success">
            <Add style={{ marginRight: 5 }} />
            Add New Admin
          </button>
        </div>

        {/* TABS */}
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
          <Tab label="Active" />
          <Tab label="Pending" />
          <Tab label="Suspended" />
        </Tabs>

        {/* SEARCH + EXPORT */}
        <Box className="allUsers-actions">
          <TextField
            className="custom-textfield"
            size="small"
            label="Search User"
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
                  <TableCell>Avatar</TableCell>

                  <TableCell onClick={() => handleSort("first_name")}>
                    Name{" "}
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
                  <TableCell>Email</TableCell>
                  <TableCell>Contact No</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Avatar
                          src={
                            u.profile_image
                              ? AppConst.PROFILE_PLACEHOLDER_IMAGE +
                                u.profile_image
                              : AppConst.PROFILE_PLACEHOLDER_IMAGE +
                                "uploads/profile_pic/user.png"
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
                                ? "You cannot suspend yourself"
                                : "Suspend"
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
                          <Tooltip title="Activate">
                            <IconButton
                              onClick={() =>
                                handleStatusChange(u.id, u.email, "active")
                              }
                            >
                              <CheckCircle color="success" />
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
          <h2 className="modal-title">Add New Admin</h2>
          <div className="form-row-modal">
            <div className="input-container">
              <TextField
                className="custom-textfield"
                size="small"
                label="First Name"
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
                    ? "First name is required and must contain only letters."
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
                label="Last Name"
                value={adminData.last_name}
                onChange={(e) => handleAdminChange("last_name", e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidLastName}
                helperText={
                  !adminData.isValidLastName
                    ? "Last name is required and must contain only letters."
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
                label="Email"
                value={adminData.email}
                onChange={(e) => handleAdminChange("email", e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidEmail}
                required
                helperText={
                  !adminData.isValidEmail
                    ? "A valid email address is required."
                    : ""
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
                label="Contact No."
                value={adminData.phone}
                onChange={(e) => handleAdminChange("phone", e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidContactNo}
                helperText={
                  !adminData.isValidContactNo
                    ? "Contact number must be 10 digits."
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
                label="New Password"
                type={adminData.showPassword ? "text" : "password"}
                value={adminData.newPassword}
                onChange={(e) => handleAdminChange("password", e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!adminData.isValidPassword}
                helperText={
                  !adminData.isValidPassword
                    ? "Password must be at least 6 characters long."
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
                label="Confirm Password"
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
                  !adminData.passwordMatch ? "Passwords do not match." : ""
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
              Save
            </button>

            <button
              onClick={() => setShowAddAdminModal(false)}
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

export default AllUsers;
