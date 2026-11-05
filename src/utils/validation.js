/* Shared validation rules (same rules in every form). */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 8+ chars, upper, lower, digit, special — same rule as the API
export const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Letters in any language (incl. Sinhala), single spaces between words
export const NAME_RE = /^[\p{L}\p{M}\u200C\u200D]+(?:[\s'-][\p{L}\p{M}\u200C\u200D]+)*$/u;

// Titles, cities, sub-categories: letters, numbers and common punctuation
export const TEXT_RE = /^[\p{L}\p{M}\p{N}\u200C\u200D][\p{L}\p{M}\p{N}\u200C\u200D\s.,'()&/+-]*$/u;

export const PHONE_RE = /^\d{10}$/;

// "15000", "15,000", "15000.50"
export const PRICE_RE = /^\d{1,3}(,?\d{3})*(\.\d{1,2})?$/;

export const isEmail = (v = "") => EMAIL_RE.test(v.trim());
export const isStrongPassword = (v = "") => STRONG_PASSWORD_RE.test(v);
export const isName = (v = "") => NAME_RE.test(v.trim());
export const isText = (v = "", min = 2) => v.trim().length >= min && TEXT_RE.test(v.trim());
export const isPhone = (v = "") => PHONE_RE.test(v.trim());
export const isPrice = (v = "") => PRICE_RE.test(String(v).trim()) && toPrice(v) > 0;
export const toPrice = (v = "") => Number(String(v).replace(/,/g, ""));
