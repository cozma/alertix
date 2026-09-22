import { isBrowserBlocked, isTicketsAvailable } from "./tickets.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function clearBrowserSnag({
  getHtml,
  reload,
  sleep = delay,
  snagWaitMs = 5_000,
  maxSnagRetries = Infinity,
}) {
  let html = await getHtml();
  let attempts = 0;

  while (isBrowserBlocked(html)) {
    if (attempts >= maxSnagRetries) {
      throw new Error(`Browser still blocked after ${maxSnagRetries} retry(ies)`);
    }
    attempts += 1;
    await sleep(snagWaitMs);
    await reload();
    html = await getHtml();
  }

  return html;
}

export async function watchForTickets({
  getHtml,
  reload,
  notify,
  sleep = delay,
  now = () => Date.now(),
  pollWindowMs = 15_000,
  pollIntervalMs = 1_000,
  snagWaitMs = 5_000,
  maxCycles = Infinity,
  maxSnagRetries = Infinity,
} = {}) {
  if (typeof getHtml !== "function" || typeof reload !== "function" || typeof notify !== "function") {
    throw new Error("getHtml, reload, and notify are required");
  }

  const recoverFromSnag = () =>
    clearBrowserSnag({ getHtml, reload, sleep, snagWaitMs, maxSnagRetries });

  let html = await recoverFromSnag();
  if (isTicketsAvailable(html)) {
    await notify();
    return true;
  }

  for (let cycle = 0; cycle < maxCycles; cycle += 1) {
    const deadline = now() + pollWindowMs;
    while (now() < deadline) {
      html = await getHtml();
      if (isTicketsAvailable(html)) {
        await notify();
        return true;
      }
      await sleep(pollIntervalMs);
    }

    await reload();
    html = await recoverFromSnag();
    if (isTicketsAvailable(html)) {
      await notify();
      return true;
    }
  }

  throw new Error(`Tickets still unavailable after ${maxCycles} poll cycle(s)`);
}
