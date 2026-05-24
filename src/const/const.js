// export const API_BASE_URL = "http://localhost:3200/api";

// export const API_BASE_URL = "https://marketplace-backend-chec.onrender.com/api";

// export const API_BASE_URL = "http://52.221.196.150/api";

export const API_BASE_URL = "/api";

export const PROFILE_PLACEHOLDER_IMAGE =
  "https://sathwa-sewana-marketplace-uploads.s3.ap-southeast-1.amazonaws.com/default/user.png";

export const ADS_PLACEHOLDER_IMAGE =
  "https://sathwa-sewana-marketplace-uploads.s3.ap-southeast-1.amazonaws.com/default/ad.png";

export const FRONTEND_BASE_URL = "http://localhost:4200";

export const API_ENDPOINTS = {
  AUTH: {
    BASE: `${API_BASE_URL}/auth`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
    RESEND: `${API_BASE_URL}/auth/resend`,
    ME: `${API_BASE_URL}/auth/me`,
    ME_IMAGE: `${API_BASE_URL}/auth/me/image`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/me`,
    UPDATE_IMAGE: `${API_BASE_URL}/auth/me/image`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/me/password`,
    DELETE_PROFILE: `${API_BASE_URL}/auth/me`,
    ADMIN_GET_USERS: `${API_BASE_URL}/auth`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/auth/${id}/status`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },

  ADS: {
    BASE: `${API_BASE_URL}/ads`,
    MY_ADS: `${API_BASE_URL}/ads/my`,
    BY_ID: (id) => `${API_BASE_URL}/ads/${id}`,
    CREATE: `${API_BASE_URL}/ads`,
    UPDATE: (id) => `${API_BASE_URL}/ads/${id}`,
    DELETE: (id) => `${API_BASE_URL}/ads/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/ads/${id}/status`,
    INCREMENT_VIEW: (id) => `${API_BASE_URL}/ads/${id}/view`,
    UPLOAD_IMAGES: (adId) => `${API_BASE_URL}/ads/${adId}/images`,
  },

  CATEGORIES: {
    BASE: `${API_BASE_URL}/categories`,
    CREATE: `${API_BASE_URL}/categories`,
    GET_ADMIN: `${API_BASE_URL}/categories/admin`,
    DELETE: (id) => `${API_BASE_URL}/categories/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/categories/${id}/status`,
    GET_ACTIVE: `${API_BASE_URL}/categories`,
    GET_ALL: `${API_BASE_URL}/categories/all`,
  },

  REVIEWS: {
    BASE: `${API_BASE_URL}/reviews`,
    CREATE: `${API_BASE_URL}/reviews`,
    BY_AD: (adId) => `${API_BASE_URL}/reviews/${adId}`,
    DELETE: (id) => `${API_BASE_URL}/reviews/${id}`,
  },

  SAVED: {
    BASE: `${API_BASE_URL}/saved`,
    CREATE: `${API_BASE_URL}/saved`,
    DELETE: (id) => `${API_BASE_URL}/saved/${id}`,
  },

  DASHBOARD: {
    BASE: `${API_BASE_URL}/dashboard`,
    HOME: `${API_BASE_URL}/dashboard/home`,
    ADMIN: `${API_BASE_URL}/dashboard/admin`,
  },

  SUPPORT: {
    BASE: `${API_BASE_URL}/support`,
    CREATE_TICKET: `${API_BASE_URL}/support/ticket`,
    SEND_MESSAGE: `${API_BASE_URL}/support/message`,
    GET_TICKETS: `${API_BASE_URL}/support`,
    GET_MESSAGES: (ticketId) => `${API_BASE_URL}/support/${ticketId}`,
    CLOSE_TICKET: (ticketId) => `${API_BASE_URL}/support/${ticketId}/close`,
  },

  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    GET_ALL: `${API_BASE_URL}/notifications`,
    COUNT: `${API_BASE_URL}/notifications/count`,
    MARK_AS_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_AS_READ: `${API_BASE_URL}/notifications/read-all`,
  },
};

export const ROUTES = {
  HOME: "/home",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  VERIFY: "/verify",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

export const DISTRICTS = [
  { value: "Ampara", label: "Ampara", si: "අම්පාර" },
  { value: "Anuradhapura", label: "Anuradhapura", si: "අනුරාධපුර" },
  { value: "Badulla", label: "Badulla", si: "බදුල්ල" },
  { value: "Batticaloa", label: "Batticaloa", si: "මඩකලපුව" },
  { value: "Colombo", label: "Colombo", si: "කොළඹ" },
  { value: "Galle", label: "Galle", si: "ගාල්ල" },
  { value: "Gampaha", label: "Gampaha", si: "ගම්පහ" },
  { value: "Hambantota", label: "Hambantota", si: "හම්බන්තොට" },
  { value: "Jaffna", label: "Jaffna", si: "යාපනය" },
  { value: "Kalutara", label: "Kalutara", si: "කළුතර" },
  { value: "Kandy", label: "Kandy", si: "මහනුවර" },
  { value: "Kegalle", label: "Kegalle", si: "කෑගල්ල" },
  { value: "Kilinochchi", label: "Kilinochchi", si: "කිලිනොච්චි" },
  { value: "Kurunegala", label: "Kurunegala", si: "කුරුණෑගල" },
  { value: "Mannar", label: "Mannar", si: "මන්නාරම" },
  { value: "Matale", label: "Matale", si: "මාතලේ" },
  { value: "Matara", label: "Matara", si: "මාතර" },
  { value: "Monaragala", label: "Monaragala", si: "මොණරාගල" },
  { value: "Mullaitivu", label: "Mullaitivu", si: "මුලතිව්" },
  { value: "Nuwara Eliya", label: "Nuwara Eliya", si: "නුවරඑළිය" },
  { value: "Polonnaruwa", label: "Polonnaruwa", si: "පොළොන්නරුව" },
  { value: "Puttalam", label: "Puttalam", si: "පුත්තලම" },
  { value: "Ratnapura", label: "Ratnapura", si: "රත්නපුර" },
  { value: "Trincomalee", label: "Trincomalee", si: "ත්‍රිකුණාමලය" },
  { value: "Vavuniya", label: "Vavuniya", si: "වව්නියාව" },
];

export const RATING_LABLES = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};
