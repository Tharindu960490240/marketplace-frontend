import { API_ENDPOINTS } from "../const/const";

/* ===========================
    SAVE AD
=========================== */
export const saveAd = async (token, adId) => {
  try {
    const res = await fetch(API_ENDPOINTS.SAVED.CREATE, {
      method: "POST",
      headers: {
        
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ad_id: adId }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to save ad");
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
    REMOVE SAVED AD
=========================== */
export const removeSavedAd = async (token, adId) => {
  try {
    const res = await fetch(API_ENDPOINTS.SAVED.DELETE(adId), {
      method: "DELETE",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to remove saved ad");
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
    GET ALL SAVED ADS (Pagination + Search)
=========================== */
export const getSavedAds = async (token, params = {}) => {
  try {
    const query = new URLSearchParams();

    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.sortField) query.append("sortField", params.sortField);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);

    const res = await fetch(`${API_ENDPOINTS.SAVED.BASE}?${query.toString()}`, {
      method: "GET",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch saved ads");
    }

    return {
      success: true,
      data: data.data,
      total: data.total,
      page: data.page,
      limit: data.limit,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
