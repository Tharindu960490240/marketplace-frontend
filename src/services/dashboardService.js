import { API_ENDPOINTS } from "../const/const";
import { apiRequest } from "./apiClient";

const unwrap = (res) =>
  res.success ? { success: true, data: res.data?.data } : res;

export const getDashboardStats = async () =>
  unwrap(await apiRequest(API_ENDPOINTS.DASHBOARD.HOME));

export const getAdminDashboardStats = async (token) =>
  unwrap(await apiRequest(API_ENDPOINTS.DASHBOARD.ADMIN, { token }));
