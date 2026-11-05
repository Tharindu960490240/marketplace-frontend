import { API_ENDPOINTS } from "../const/const";
import { apiRequest, buildQuery } from "./apiClient";

export const saveAd = (token, adId) =>
  apiRequest(API_ENDPOINTS.SAVED.CREATE, {
    method: "POST",
    token,
    body: { ad_id: adId },
  });

export const removeSavedAd = (token, adId) =>
  apiRequest(API_ENDPOINTS.SAVED.DELETE(adId), { method: "DELETE", token });

export const getSavedAds = async (token, params = {}) => {
  const res = await apiRequest(
    `${API_ENDPOINTS.SAVED.BASE}${buildQuery(params)}`,
    { token },
  );
  if (!res.success) return res;
  return {
    success: true,
    data: res.data?.data || [],
    total: res.data?.total || 0,
  };
};
