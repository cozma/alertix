import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadConfig } from "../lib/config.js";

const eventUrl = "https://www.ticketmaster.com/lady-gaga-tickets/event/1D0060A0D0A12345";

function validEnv(overrides = {}) {
  return {
    TWILIO_ACCOUNT_SID: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    TWILIO_AUTH_TOKEN: "token",
    TWILIO_FROM_NUMBER: "+15551234567",
    TWILIO_TO_NUMBER: "+15557654321",
    ...overrides,
  };
}

describe("loadConfig", () => {
  it("loads Twilio credentials and the event slug from the URL", () => {
    const config = loadConfig(validEnv(), ["node", "index.js", eventUrl]);

    assert.equal(config.eventUrl, eventUrl);
    assert.equal(config.eventSlug, "lady-gaga-tickets");
    assert.deepEqual(config.twilio, {
      accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      authToken: "token",
      from: "+15551234567",
      to: "+15557654321",
    });
    assert.equal(config.headless, false);
    assert.equal(config.useSmartProxy, false);
    assert.equal(config.pollWindowMs, 15_000);
    assert.equal(config.pollIntervalMs, 1_000);
    assert.equal(config.snagWaitMs, 5_000);
  });

  it("enables optional flags and numeric overrides from the environment", () => {
    const config = loadConfig(
      validEnv({
        HEADLESS: "true",
        USE_ZYTE_SMARTPROXY: "true",
        POLL_WINDOW_MS: "20000",
        POLL_INTERVAL_MS: "2500",
        SNAG_WAIT_MS: "8000",
      }),
      ["node", "index.js", eventUrl],
    );

    assert.equal(config.headless, true);
    assert.equal(config.useSmartProxy, true);
    assert.equal(config.pollWindowMs, 20_000);
    assert.equal(config.pollIntervalMs, 2_500);
    assert.equal(config.snagWaitMs, 8_000);
  });

  it("falls back to defaults when numeric env values are invalid", () => {
    const config = loadConfig(
      validEnv({ POLL_WINDOW_MS: "nope", POLL_INTERVAL_MS: "0", SNAG_WAIT_MS: "-1" }),
      ["node", "index.js", eventUrl],
    );

    assert.equal(config.pollWindowMs, 15_000);
    assert.equal(config.pollIntervalMs, 1_000);
    assert.equal(config.snagWaitMs, 5_000);
  });

  it("requires an event URL argument", () => {
    assert.throws(
      () => loadConfig(validEnv(), ["node", "index.js"]),
      /Usage: node index.js <ticketmaster-event-url>/,
    );
  });

  it("lists every missing Twilio environment variable", () => {
    assert.throws(
      () => loadConfig({}, ["node", "index.js", eventUrl]),
      /Missing required environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, TWILIO_TO_NUMBER/,
    );
  });
});
