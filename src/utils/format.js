/* Formatting helpers shared across screens. */

export const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "Rs. —";
  return `Rs. ${num.toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;
};

export const formatNumber = (value) => Number(value || 0).toLocaleString();

export const formatDate = (value, lang = "en") => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(lang === "si" ? "si-LK" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* Rating label from translations: keys rating_labels.r05 … r50 */
export const getRatingLabel = (t, rating) => {
  if (!rating) return t("rating_labels.none");
  const rounded = Math.round(Number(rating) * 2) / 2;
  const key = `r${String(Math.round(rounded * 10)).padStart(2, "0")}`;
  return t(`rating_labels.${key}`);
};

export const formatRating = (rating) =>
  rating ? Number(rating).toFixed(1) : "0.0";

/* "Kandy, Kandy" → "Kandy" when the city and district are the same */
export const formatLocation = (city, district) => {
  const parts = [city, district].map((v) => (v || "").trim()).filter(Boolean);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return parts[0];
  }
  return parts.join(", ");
};
