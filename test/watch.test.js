import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BROWSER_SNAG_MARKER, TICKETS_AVAILABLE_MARKER } from "../lib/tickets.js";
import { clearBrowserSnag, watchForTickets } from "../lib/watch.js";

const AVAILABLE = `<div class="${TICKETS_AVAILABLE_MARKER}"></div>`;
const UNAVAILABLE = "<html>No Tickets Available</html>";
const BLOCKED = `<h1>${BROWSER_SNAG_MARKER}</h1>`;

function createFakeTimers(start = 0) {
  let current = start;
  return {
    now: () => current,
    sleep: async (ms) => {
      current += ms;
    },
  };
}

function htmlFromSequence(pages) {
  let index = 0;
  return async () => {
    const html = pages[Math.min(index, pages.length - 1)];
    index += 1;
    return html;
  };
}

describe("clearBrowserSnag", () => {
  it("returns the first unblocked page without reloading", async () => {
    const reloads = [];
    const html = await clearBrowserSnag({
      getHtml: htmlFromSequence([UNAVAILABLE]),
      reload: async () => {
        reloads.push("reload");
      },
      sleep: async () => {},
    });

    assert.equal(html, UNAVAILABLE);
    assert.equal(reloads.length, 0);
  });

  it("reloads until the snag page is gone", async () => {
    const waits = [];
    const html = await clearBrowserSnag({
      getHtml: htmlFromSequence([BLOCKED, BLOCKED, AVAILABLE]),
      reload: async () => {},
      sleep: async (ms) => {
        waits.push(ms);
      },
      snagWaitMs: 5_000,
    });

    assert.equal(html, AVAILABLE);
    assert.deepEqual(waits, [5_000, 5_000]);
  });

  it("stops after the snag retry limit", async () => {
    await assert.rejects(
      () =>
        clearBrowserSnag({
          getHtml: async () => BLOCKED,
          reload: async () => {},
          sleep: async () => {},
          maxSnagRetries: 2,
        }),
      /Browser still blocked after 2 retry\(ies\)/,
    );
  });
});

describe("watchForTickets", () => {
  it("requires the page and notify callbacks", async () => {
    await assert.rejects(() => watchForTickets(), /getHtml, reload, and notify are required/);
  });

  it("notifies immediately when tickets are already listed", async () => {
    const timers = createFakeTimers();
    let notified = 0;
    let reloads = 0;

    const found = await watchForTickets({
      getHtml: async () => AVAILABLE,
      reload: async () => {
        reloads += 1;
      },
      notify: async () => {
        notified += 1;
      },
      sleep: timers.sleep,
      now: timers.now,
    });

    assert.equal(found, true);
    assert.equal(notified, 1);
    assert.equal(reloads, 0);
  });

  it("retries a blocked first load before notifying", async () => {
    const timers = createFakeTimers();
    let notified = 0;

    const found = await watchForTickets({
      getHtml: htmlFromSequence([BLOCKED, AVAILABLE]),
      reload: async () => {},
      notify: async () => {
        notified += 1;
      },
      sleep: timers.sleep,
      now: timers.now,
      snagWaitMs: 5_000,
    });

    assert.equal(found, true);
    assert.equal(notified, 1);
    assert.equal(timers.now(), 5_000);
  });

  it("notifies when tickets appear during the poll window", async () => {
    const timers = createFakeTimers();
    const pages = [UNAVAILABLE, UNAVAILABLE, AVAILABLE];
    let notified = 0;

    const found = await watchForTickets({
      getHtml: htmlFromSequence(pages),
      reload: async () => {
        throw new Error("should not reload after tickets appear");
      },
      notify: async () => {
        notified += 1;
      },
      sleep: timers.sleep,
      now: timers.now,
      pollWindowMs: 15_000,
      pollIntervalMs: 1_000,
    });

    assert.equal(found, true);
    assert.equal(notified, 1);
  });

  it("reloads after a poll window and notifies when the next page has tickets", async () => {
    const timers = createFakeTimers();
    let reloads = 0;
    let notified = 0;

    const found = await watchForTickets({
      getHtml: htmlFromSequence([UNAVAILABLE, UNAVAILABLE, AVAILABLE]),
      reload: async () => {
        reloads += 1;
      },
      notify: async () => {
        notified += 1;
      },
      sleep: timers.sleep,
      now: timers.now,
      pollWindowMs: 1_000,
      pollIntervalMs: 1_000,
    });

    assert.equal(found, true);
    assert.equal(reloads, 1);
    assert.equal(notified, 1);
  });

  it("keeps polling until the cycle limit when tickets never appear", async () => {
    const timers = createFakeTimers();
    let reloads = 0;

    await assert.rejects(
      () =>
        watchForTickets({
          getHtml: async () => UNAVAILABLE,
          reload: async () => {
            reloads += 1;
          },
          notify: async () => {
            throw new Error("should not notify when tickets are missing");
          },
          sleep: timers.sleep,
          now: timers.now,
          pollWindowMs: 1_000,
          pollIntervalMs: 1_000,
          maxCycles: 2,
        }),
      /Tickets still unavailable after 2 poll cycle\(s\)/,
    );

    assert.equal(reloads, 2);
  });
});
