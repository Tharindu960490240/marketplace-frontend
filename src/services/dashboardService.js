import { API_ENDPOINTS } from "../const/const";

/* ===========================
    GET DASHBOARD STATS
=========================== */
export const getDashboardStats = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.DASHBOARD.HOME, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch dashboard stats");
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    GET DASHBOARD STATS (ADMIN)
=========================== */
export const getAdminDashboardStats = async (token) => {
  try {
    const res = await fetch(API_ENDPOINTS.DASHBOARD.ADMIN, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch dashboard stats");
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
