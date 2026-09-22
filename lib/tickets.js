export const TICKETS_AVAILABLE_MARKER = "edp-quantity-filter-button";
export const BROWSER_SNAG_MARKER = "Your browser hit a snag";

export function isTicketsAvailable(html) {
  return typeof html === "string" && html.includes(TICKETS_AVAILABLE_MARKER);
}

export function isBrowserBlocked(html) {
  return typeof html === "string" && html.includes(BROWSER_SNAG_MARKER);
}

export function eventSlugFromUrl(url) {
  if (typeof url !== "string" || url.trim() === "") {
    throw new Error("A Ticketmaster event URL is required");
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid event URL: ${url}`);
  }

  const slug = parsed.pathname.split("/").filter(Boolean)[0];
  if (!slug) {
    throw new Error(`Could not read event name from URL: ${url}`);
  }

  return slug;
}

export function buildAlertMessage(eventSlug, url) {
  return `ALERT: Resale for ${eventSlug} available here: ${url}`;
}
