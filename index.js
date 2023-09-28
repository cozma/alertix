import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import SmartProxy from "zyte-smartproxy-puppeteer";
import { default as twilio } from 'twilio'

const accountSid = '<INSERT TWILIO ACCOUNT SID>';
const authToken = '<INSERT TWILIO AUTH TOKEN>';
const client = twilio(accountSid, authToken);

puppeteer.use(StealthPlugin())
puppeteer.use(SmartProxy) // optional but need a paid account

const getAlerts = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            // if you want to work with proxies
            // '--incognito',
            // '--proxy-server=127.0.0.1:9876'
        ]
    });
    const event = process.argv[2].split("/");

    let page = await browser.newPage();
    // await page.setJavaScriptEnabled(false)
    let pages = await browser.pages();
    const oldPage = pages[0];
    await oldPage.close();

    await page.goto(process.argv[2], {
        waitUntil: "domcontentloaded",
        timeout: 0
    });
    await page.waitForNetworkIdle();

    let html = await page.content();
    console.log(html)
    sleep(1000)
    while (html.includes("Your browser hit a snag")){
        sleep(5000)
        await page.reload();
        html = await page.content();
        console.log(html)
    }

    if (!html.includes("edp-quantity-filter-button")) {
        console.log("No Tickets Available");

        while(!html.includes("edp-quantity-filter-button")){
            const msToRun = 15000 // 10 seconds
            const t0 = performance.now() // or Date.now()
            let flag = false;
            while (!flag) {
                html = await page.content();
                if  (html.includes("edp-quantity-filter-button")){
                    await client.messages
                        .create({
                            body: 'ALERT: Resale for ' + event.at(3) + ' available here: ' + process.argv[2],
                            from: '<INSERT TWILIO PHONE NUMBER>',
                            to: '<INSERT DESINATION PHONE NUMBERS>'
                        })
                    console.log('SMS sent successfully! 🌟');
                    await browser.close();
                    return true;
                }
                if (performance.now() - t0 >= msToRun) {
                    flag = true;
                }
            }
            await page.reload();
            html = await page.content();
            while (html.includes("Your browser hit a snag")){
                sleep(5000)
                await page.reload();
                html = await page.content();
                console.log(html)
            }
            console.log(html)
            console.log("No Tickets Available");
            console.log('page is now refreshing...')
        }
    }
    if (html.includes("edp-quantity-filter-button")){
        await client.messages
            .create({
                body: 'ALERT: Resale for ' + event.at(3) + ' available here: ' + process.argv[2],
                from: '<INSERT TWILIO PHONE NUMBER>',
                to: '<INSERT DESINATION PHONE NUMBERS>'
            })
        console.log('SMS sent successfully! 🌟');
        await browser.close();
        return true;
    }
};

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

// Start the scraping
getAlerts().then(r => {
    if (r) {
        console.log('sending alerts')
    }
});
