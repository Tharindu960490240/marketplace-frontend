import { API_ENDPOINTS } from "../const/const";

/* ===========================
    GET NOTIFICATIONS
=========================== */
export const getNotifications = async (token) => {
  try {
    const res = await fetch(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch notifications");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getNotificationsCount = async (token) => {
  try {
    const res = await fetch(API_ENDPOINTS.NOTIFICATIONS.COUNT, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch notifications count");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    MARK SINGLE AS READ
=========================== */
export const markNotificationAsRead = async (token, id) => {
  try {
    const res = await fetch(
      API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id),
      {
        method: "PATCH",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to mark as read");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    MARK ALL AS READ
=========================== */
export const markAllNotificationsAsRead = async (token) => {
  try {
    const res = await fetch(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ,
      {
        method: "PATCH",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to mark all as read");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};