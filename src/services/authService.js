import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "../const/const";
import { apiRequest, buildQuery } from "./apiClient";

const TOKEN_KEY = "Token";
const TIMESTAMP_KEY = "sessionTimestamp";
const SESSION_HOURS = 24;

/* ================= SESSION HELPERS ================= */

export const saveSession = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
};

/* Only removes auth keys — keeps theme/language preferences. */
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
};

const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp ? exp * 1000 < Date.now() : false;
  } catch {
    return true;
  }
};

/* Returns a valid token, or null (clearing stale sessions). */
export async function get_token() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const ts = parseInt(localStorage.getItem(TIMESTAMP_KEY) || "0", 10);
  const tooOld = Date.now() - ts > SESSION_HOURS * 60 * 60 * 1000;

  if (tooOld || isTokenExpired(token)) {
    clearSession();
    return null;
  }
  return token;
}

export async function getMyData() {
  const token = await get_token();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

/* ================= AUTH ================= */

export const registerUser = async (userData) => {
  // Send only the fields the API needs (no UI flags)
  const { first_name, last_name, email, phone, password, role } = userData;
  const payload = { first_name, last_name, email, phone, password };
  if (role) payload.role = role;
  return apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: payload,
  });
};

export const loginUser = (credentials) =>
  apiRequest(API_ENDPOINTS.AUTH.LOGIN, { method: "POST", body: credentials });

export const verifyEmail = (token) =>
  apiRequest(`${API_ENDPOINTS.AUTH.VERIFY}/${token}`);

export const getProfile = async (token) => {
  const res = await apiRequest(API_ENDPOINTS.AUTH.ME, { token });
  return res.success ? { success: true, user: res.data } : res;
};

export const updateProfile = (token, userData) =>
  apiRequest(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
    method: "PUT",
    token,
    body: userData,
  });

export const updateProfileImage = (token, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  return apiRequest(API_ENDPOINTS.AUTH.ME_IMAGE, {
    method: "PUT",
    token,
    formData,
  });
};

export const changePassword = (token, passwordData) =>
  apiRequest(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    method: "PUT",
    token,
    body: passwordData,
  });

export const resendVerification = (email) =>
  apiRequest(API_ENDPOINTS.AUTH.RESEND, { method: "POST", body: { email } });

export const updateUserStatus = (token, userId, email, status) =>
  apiRequest(API_ENDPOINTS.AUTH.UPDATE_STATUS(userId), {
    method: "PATCH",
    token,
    body: { email, status },
  });

export const sendPasswordResetLink = (email) =>
  apiRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    method: "POST",
    body: { email },
  });

export const resetPassword = (token, password) =>
  apiRequest(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: "POST",
    body: { token, password },
  });

export const getAllUsers = async (token, params = {}) => {
  const res = await apiRequest(
    `${API_ENDPOINTS.AUTH.BASE}${buildQuery({
      page: params.page,
      limit: params.limit,
      status: params.status,
      search: params.search,
      role: params.role,
      sortField: params.sortField,
      sortOrder: params.sortOrder,
    })}`,
    { token },
  );
  if (!res.success) return res;
  return {
    success: true,
    data: res.data?.data || [],
    total: res.data?.total || 0,
  };
};

export const deleteProfile = (token) =>
  apiRequest(API_ENDPOINTS.AUTH.DELETE_PROFILE, { method: "DELETE", token });
