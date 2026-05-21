import { API_ENDPOINTS } from "../const/const";

/* ===========================
    GET ACTIVE CATEGORIES (Dropdown)
=========================== */
export const getActiveCategories = async (token) => {
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORIES.GET_ACTIVE, {
      method: "GET",
      headers: {
        
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch categories");
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
    GET ALL CATEGORIES (Public filter)
=========================== */
export const getAllCategories = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORIES.GET_ALL, {
      method: "GET",
      headers: {
        
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch categories");
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
    ADMIN - GET CATEGORIES (Pagination + Search)
=========================== */
export const getAllCategoriesAdmin = async (token, params = {}) => {
  try {
    const query = new URLSearchParams();

    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.sortField) query.append("sortField", params.sortField);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);

    const res = await fetch(
      `${API_ENDPOINTS.CATEGORIES.GET_ADMIN}?${query.toString()}`,
      {
        method: "GET",
        headers: {
          
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch categories");
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

/* ===========================
    CREATE CATEGORY
=========================== */
export const createCategory = async (token, categoryData) => {
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORIES.CREATE, {
      method: "POST",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create category");
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
    UPDATE CATEGORY STATUS
=========================== */
export const updateCategoryStatus = async (token, id, status) => {
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORIES.UPDATE_STATUS(id), {
      method: "PATCH",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to update status");
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
    DELETE CATEGORY
=========================== */
export const deleteCategory = async (token, id) => {
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORIES.DELETE(id), {
      method: "DELETE",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete category");
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
