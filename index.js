import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import twilio from "twilio";
import { loadConfig } from "./lib/config.js";
import { buildAlertMessage } from "./lib/tickets.js";
import { watchForTickets } from "./lib/watch.js";

puppeteer.use(StealthPlugin());

async function launchBrowser(config) {
  if (config.useSmartProxy) {
    const { default: SmartProxy } = await import("zyte-smartproxy-puppeteer");
    puppeteer.use(SmartProxy);
  }

  return puppeteer.launch({
    headless: config.headless,
    args: [],
  });
}

export async function run(env = process.env, argv = process.argv) {
  const config = loadConfig(env, argv);
  const client = twilio(config.twilio.accountSid, config.twilio.authToken);
  const browser = await launchBrowser(config);

  try {
    const page = await browser.newPage();
    const extraPages = (await browser.pages()).filter((openPage) => openPage !== page);
    await Promise.all(extraPages.map((openPage) => openPage.close()));

    await page.goto(config.eventUrl, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });
    await page.waitForNetworkIdle();

    const found = await watchForTickets({
      getHtml: () => page.content(),
      reload: () => page.reload({ waitUntil: "domcontentloaded" }),
      notify: async () => {
        await client.messages.create({
          body: buildAlertMessage(config.eventSlug, config.eventUrl),
          from: config.twilio.from,
          to: config.twilio.to,
        });
        console.log("SMS sent successfully");
      },
      pollWindowMs: config.pollWindowMs,
      pollIntervalMs: config.pollIntervalMs,
      snagWaitMs: config.snagWaitMs,
    });

    if (found) {
      console.log("sending alerts");
    }

    return found;
  } finally {
    await browser.close();
  }
}

function isMainModule() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
