import { API_ENDPOINTS } from "../const/const";

/* ===========================
   CREATE AD
=========================== */
export const createAd = async (token, adData) => {
  try {
    const res = await fetch(API_ENDPOINTS.ADS.CREATE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Ad creation failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
   GET ALL ADS
=========================== */
export const getAds = async (params = {}, token = null) => {
  try {
    const query = new URLSearchParams();

    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.district) query.append("district", params.district);
    if (params.category_id) query.append("category_id", params.category_id);
    if (params.status) query.append("status", params.status);

    const headers = {
      
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_ENDPOINTS.ADS.BASE}?${query.toString()}`, {
      method: "GET",
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch ads");
    }

    return {
      success: true,
      data: data.data,
      total: data.total,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
   GET SINGLE AD
=========================== */
export const getAdById = async (id, token = null) => {
  try {
    const headers = {
      
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(API_ENDPOINTS.ADS.BY_ID(id), {
      method: "GET",
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch ad");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
   GET MY ADS
=========================== */
export const getMyAds = async (params = {}, token = null) => {
  try {
    const query = new URLSearchParams();

    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);

    const headers = {
      
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_ENDPOINTS.ADS.MY_ADS}?${query.toString()}`, {
      method: "GET",
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch my ads");
    }

    return {
      success: true,
      data: data.data,
      total: data.total,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
   UPDATE AD
=========================== */
export const updateAd = async (token, adId, adData) => {
  try {
    const res = await fetch(API_ENDPOINTS.ADS.UPDATE(adId), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify(adData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to update ad");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
   DELETE AD
=========================== */
export const deleteAd = async (token, adId) => {
  try {
    const res = await fetch(API_ENDPOINTS.ADS.DELETE(adId), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete ad");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
   MARK AS SOLD
=========================== */
export const updateAdStatus = async (token, adId, status, reason) => {
  try {
    const res = await fetch(API_ENDPOINTS.ADS.UPDATE_STATUS(adId), {
      method: "PATCH",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, reason }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to mark as sold");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
   INCREMENT VIEW
=========================== */
export const incrementAdView = async (adId) => {
  try {
    const res = await fetch(API_ENDPOINTS.ADS.INCREMENT_VIEW(adId), {
      method: "PATCH",
      headers: {
        
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to increment view");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
   UPLOAD AD IMAGES
=========================== */
export const uploadAdImages = async (token, adId, images) => {
  try {
    const formData = new FormData();

    images.forEach((img) => {
      formData.append("images", img);
    });

    const res = await fetch(API_ENDPOINTS.ADS.UPLOAD_IMAGES(adId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Image upload failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
