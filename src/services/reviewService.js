import { API_ENDPOINTS } from "../const/const";

/* ===========================
    CREATE REVIEW (USER)
=========================== */
export const createReview = async (token, reviewData) => {
  try {
    const res = await fetch(API_ENDPOINTS.REVIEWS.CREATE, {
      method: "POST",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData), // { ad_id, rating, comment }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create review");
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
    GET REVIEWS BY AD
=========================== */
export const getReviewsByAd = async (adId) => {
  try {
    const res = await fetch(API_ENDPOINTS.REVIEWS.BY_AD(adId), {
      method: "GET",
      headers: {
        
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch reviews");
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
    DELETE REVIEW (ADMIN ONLY)
=========================== */
export const deleteReview = async (token, id) => {
  try {
    const res = await fetch(API_ENDPOINTS.REVIEWS.DELETE(id), {
      method: "DELETE",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete review");
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