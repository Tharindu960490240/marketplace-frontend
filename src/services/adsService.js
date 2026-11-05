import { API_ENDPOINTS } from "../const/const";
import { apiRequest, buildQuery } from "./apiClient";

const listResult = (res) =>
  res.success
    ? { success: true, data: res.data?.data || [], total: res.data?.total || 0 }
    : res;

export const createAd = (token, adData) =>
  apiRequest(API_ENDPOINTS.ADS.CREATE, { method: "POST", token, body: adData });

export const getAds = async (params = {}, token = null) =>
  listResult(
    await apiRequest(
      `${API_ENDPOINTS.ADS.BASE}${buildQuery({
        page: params.page,
        limit: params.limit,
        search: params.search,
        district: params.district,
        category_id: params.category_id,
        status: params.status,
      })}`,
      { token },
    ),
  );

export const getAdById = (id, token = null) =>
  apiRequest(API_ENDPOINTS.ADS.BY_ID(id), { token });

export const getMyAds = async (params = {}, token = null) =>
  listResult(
    await apiRequest(
      `${API_ENDPOINTS.ADS.MY_ADS}${buildQuery({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status,
      })}`,
      { token },
    ),
  );

export const updateAd = (token, adId, adData) =>
  apiRequest(API_ENDPOINTS.ADS.UPDATE(adId), {
    method: "PUT",
    token,
    body: adData,
  });

export const deleteAd = (token, adId) =>
  apiRequest(API_ENDPOINTS.ADS.DELETE(adId), { method: "DELETE", token });

export const updateAdStatus = (token, adId, status, reason = null) =>
  apiRequest(API_ENDPOINTS.ADS.UPDATE_STATUS(adId), {
    method: "PATCH",
    token,
    body: { status, reason },
  });

export const incrementAdView = (adId) =>
  apiRequest(API_ENDPOINTS.ADS.INCREMENT_VIEW(adId), { method: "PATCH" });

export const uploadAdImages = (token, adId, images) => {
  const formData = new FormData();
  images.forEach((img) => formData.append("images", img));
  return apiRequest(API_ENDPOINTS.ADS.UPLOAD_IMAGES(adId), {
    method: "POST",
    token,
    formData,
  });
};
