import { API_ENDPOINTS } from "../const/const";
import { apiRequest } from "./apiClient";

export const getNotifications = (token) =>
  apiRequest(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, { token });

export const getNotificationsCount = (token) =>
  apiRequest(API_ENDPOINTS.NOTIFICATIONS.COUNT, { token });

export const markNotificationAsRead = (token, id) =>
  apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id), {
    method: "PATCH",
    token,
  });

export const markAllNotificationsAsRead = (token) =>
  apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ, {
    method: "PATCH",
    token,
  });
