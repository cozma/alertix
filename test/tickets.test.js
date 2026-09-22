import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BROWSER_SNAG_MARKER,
  TICKETS_AVAILABLE_MARKER,
  buildAlertMessage,
  eventSlugFromUrl,
  isBrowserBlocked,
  isTicketsAvailable,
} from "../lib/tickets.js";

describe("isTicketsAvailable", () => {
  it("detects the Ticketmaster quantity filter marker", () => {
    assert.equal(
      isTicketsAvailable(`<button class="${TICKETS_AVAILABLE_MARKER}">2</button>`),
      true,
    );
  });

  it("returns false when the marker is missing or the input is not a string", () => {
    assert.equal(isTicketsAvailable("<html>No Tickets Available</html>"), false);
    assert.equal(isTicketsAvailable(""), false);
    assert.equal(isTicketsAvailable(null), false);
    assert.equal(isTicketsAvailable(undefined), false);
  });
});

describe("isBrowserBlocked", () => {
  it("detects Ticketmaster's browser snag page", () => {
    assert.equal(isBrowserBlocked(`<h1>${BROWSER_SNAG_MARKER}</h1>`), true);
  });

  it("returns false for a normal event page", () => {
    assert.equal(isBrowserBlocked("<html>event details</html>"), false);
    assert.equal(isBrowserBlocked(), false);
  });
});

describe("eventSlugFromUrl", () => {
  it("reads the event slug from a Ticketmaster URL", () => {
    assert.equal(
      eventSlugFromUrl("https://www.ticketmaster.com/lady-gaga-tickets/event/1D0060A0D0A12345"),
      "lady-gaga-tickets",
    );
  });

  it("ignores query strings and trailing slashes", () => {
    assert.equal(
      eventSlugFromUrl("https://www.ticketmaster.com/phish-tickets/event/abc/?foo=bar"),
      "phish-tickets",
    );
  });

  it("rejects missing or invalid URLs", () => {
    assert.throws(() => eventSlugFromUrl(""), /Ticketmaster event URL is required/);
    assert.throws(() => eventSlugFromUrl("not-a-url"), /Invalid event URL/);
    assert.throws(() => eventSlugFromUrl("https://www.ticketmaster.com/"), /Could not read event name/);
  });
});

describe("buildAlertMessage", () => {
  it("includes the event slug and listing URL", () => {
    const url = "https://www.ticketmaster.com/lady-gaga-tickets/event/1D0060A0D0A12345";
    assert.equal(
      buildAlertMessage("lady-gaga-tickets", url),
      `ALERT: Resale for lady-gaga-tickets available here: ${url}`,
    );
  });
});
