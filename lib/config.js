import { eventSlugFromUrl } from "./tickets.js";

const DEFAULT_POLL_WINDOW_MS = 15_000;
const DEFAULT_POLL_INTERVAL_MS = 1_000;
const DEFAULT_SNAG_WAIT_MS = 5_000;

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export function loadConfig(env = process.env, argv = process.argv) {
  const eventUrl = argv[2];
  if (!eventUrl) {
    throw new Error("Usage: node index.js <ticketmaster-event-url>");
  }

  const required = {
    TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER: env.TWILIO_FROM_NUMBER,
    TWILIO_TO_NUMBER: env.TWILIO_TO_NUMBER,
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    eventUrl,
    eventSlug: eventSlugFromUrl(eventUrl),
    twilio: {
      accountSid: required.TWILIO_ACCOUNT_SID,
      authToken: required.TWILIO_AUTH_TOKEN,
      from: required.TWILIO_FROM_NUMBER,
      to: required.TWILIO_TO_NUMBER,
    },
    headless: env.HEADLESS === "true",
    useSmartProxy: env.USE_ZYTE_SMARTPROXY === "true",
    pollWindowMs: readPositiveInt(env.POLL_WINDOW_MS, DEFAULT_POLL_WINDOW_MS),
    pollIntervalMs: readPositiveInt(env.POLL_INTERVAL_MS, DEFAULT_POLL_INTERVAL_MS),
    snagWaitMs: readPositiveInt(env.SNAG_WAIT_MS, DEFAULT_SNAG_WAIT_MS),
  };
}
