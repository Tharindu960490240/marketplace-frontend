/* =========================================================
   Shared fetch helper used by every service.
   - Adds the Bearer token when one is passed
   - Parses JSON safely (a 502 HTML page no longer crashes)
   - Reads the error from `error` or `message`
   - Fires "auth:expired" on 401 so the app can sign out
========================================================= */

export const AUTH_EXPIRED_EVENT = "auth:expired";

export async function apiRequest(
  url,
  { method = "GET", token = null, body, formData } = {},
) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!res.ok) {
      if (res.status === 401 && token) {
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
      return {
        success: false,
        status: res.status,
        message: data?.error || data?.message || `Request failed (${res.status})`,
        raw: data,
      };
    }

    return { success: true, status: res.status, data };
  } catch (error) {
    return { success: false, status: 0, message: error.message };
  }
}

export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
};
