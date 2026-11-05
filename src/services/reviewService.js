import { API_ENDPOINTS } from "../const/const";
import { apiRequest } from "./apiClient";

/* reviewData: { ad_id, rating, comment } */
export const createReview = (token, reviewData) =>
  apiRequest(API_ENDPOINTS.REVIEWS.CREATE, {
    method: "POST",
    token,
    body: reviewData,
  });

export const getReviewsByAd = (adId) =>
  apiRequest(API_ENDPOINTS.REVIEWS.BY_AD(adId));

export const deleteReview = (token, id) =>
  apiRequest(API_ENDPOINTS.REVIEWS.DELETE(id), { method: "DELETE", token });
