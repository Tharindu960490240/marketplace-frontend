import { API_ENDPOINTS } from "../const/const";
import { apiRequest } from "./apiClient";

export const createSupportTicket = (token, ticketData) =>
  apiRequest(API_ENDPOINTS.SUPPORT.CREATE_TICKET, {
    method: "POST",
    token,
    body: ticketData,
  });

export const sendSupportMessage = (token, messageData) =>
  apiRequest(API_ENDPOINTS.SUPPORT.SEND_MESSAGE, {
    method: "POST",
    token,
    body: messageData,
  });

export const getSupportTickets = async (token) => {
  const res = await apiRequest(API_ENDPOINTS.SUPPORT.GET_TICKETS, { token });
  return res.success ? { success: true, data: res.data || [] } : res;
};

export const getSupportMessages = async (token, ticketId) => {
  const res = await apiRequest(API_ENDPOINTS.SUPPORT.GET_MESSAGES(ticketId), {
    token,
  });
  return res.success ? { success: true, data: res.data || [] } : res;
};

export const closeSupportTicket = (token, ticketId) =>
  apiRequest(API_ENDPOINTS.SUPPORT.CLOSE_TICKET(ticketId), {
    method: "PATCH",
    token,
  });
