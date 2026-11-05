/* Share a link with the native share sheet, or copy it.
   Returns "shared" | "copied" | "cancelled" | "failed". */

const legacyCopy = (text) => {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
};

export const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through */
    }
  }
  return legacyCopy(text);
};

export const shareOrCopy = async ({ url, title, text }) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
      // otherwise fall back to copying
    }
  }
  const copied = await copyText(text ? `${text}\n${url}` : url);
  return copied ? "copied" : "failed";
};
