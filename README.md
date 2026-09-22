[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](https://choosealicense.com/licenses/mit/) [![Build Passing](https://img.shields.io/badge/Build-Passing-green.svg)]()

# Alertix

Alertix is a simple notification script for Ticketmaster resale tickets. When someone lists tickets for resale on a sold-out event, you get a text alert.

![IMG_2110](https://github.com/cozma/alertix/assets/5613132/1eb918ab-3fc1-413e-8a1e-eb3b24594f12)

## Requirements

- Node.js 18 or later
- A Twilio account with SMS set up. Follow [Twilio's trial account guide](https://www.twilio.com/docs/sms/tutorials/how-work-your-free-twilio-trial-account) if you do not have one yet.

## Environment variables

Set these before running the scraper. Do not put credentials in source files.

| Variable | Required | Description |
| --- | --- | --- |
| `TWILIO_ACCOUNT_SID` | yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | yes | Twilio auth token |
| `TWILIO_FROM_NUMBER` | yes | Twilio phone number to send from |
| `TWILIO_TO_NUMBER` | yes | Phone number that should receive alerts |
| `HEADLESS` | no | Set to `true` to hide the browser (default is headed, matching the original script) |
| `USE_ZYTE_SMARTPROXY` | no | Set to `true` to enable Zyte Smart Proxy (paid account required) |
| `POLL_WINDOW_MS` | no | How long to poll a loaded page before reloading (default `15000`) |
| `POLL_INTERVAL_MS` | no | Delay between poll checks (default `1000`) |
| `SNAG_WAIT_MS` | no | Delay before retrying a blocked/"snag" page (default `5000`) |

## Installation

```bash
cd alertix
npm install
```

## Run

```bash
node index.js https://www.ticketmaster.com/<event-slug>/event/<event-id>
```

## Tests

```bash
npm test
```
