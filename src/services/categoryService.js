import { API_ENDPOINTS } from "../const/const";
import { apiRequest, buildQuery } from "./apiClient";

export const getActiveCategories = (token) =>
  apiRequest(API_ENDPOINTS.CATEGORIES.GET_ACTIVE, { token });

export const getAllCategories = () =>
  apiRequest(API_ENDPOINTS.CATEGORIES.GET_ALL);

export const getAllCategoriesAdmin = async (token, params = {}) => {
  const res = await apiRequest(
    `${API_ENDPOINTS.CATEGORIES.GET_ADMIN}${buildQuery(params)}`,
    { token },
  );
  if (!res.success) return res;
  return {
    success: true,
    data: res.data?.data || [],
    total: res.data?.total || 0,
  };
};

export const createCategory = (token, categoryData) =>
  apiRequest(API_ENDPOINTS.CATEGORIES.CREATE, {
    method: "POST",
    token,
    body: categoryData,
  });

export const updateCategoryStatus = (token, id, status) =>
  apiRequest(API_ENDPOINTS.CATEGORIES.UPDATE_STATUS(id), {
    method: "PATCH",
    token,
    body: { status },
  });

export const deleteCategory = (token, id) =>
  apiRequest(API_ENDPOINTS.CATEGORIES.DELETE(id), { method: "DELETE", token });
