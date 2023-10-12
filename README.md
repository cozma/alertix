[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](https://choosealicense.com/licenses/mit/) [![Build Passing](https://img.shields.io/badge/Build-Passing-green.svg)]()


# Alertix

Alertix is a simple Notification script for Ticketmaster resale tickets. When someone puts up tickets for resale on a sold out event, you get a text alert.

![IMG_2110](https://github.com/cozma/alertix/assets/5613132/1eb918ab-3fc1-413e-8a1e-eb3b24594f12)

# Requirements

You will need a Twilio account with SMS set up. You can make a Twilio account and follow this simple setup guide: https://www.twilio.com/docs/sms/tutorials/how-work-your-free-twilio-trial-account





## Environment Variables

To run this project, you will need to update `index.js` in the following locations:

`const accountSid = '<INSERT TWILIO ACCOUNT SID>';`

`const authToken = '<INSERT TWILIO AUTH TOKEN>';`

`from: '<INSERT TWILIO PHONE NUMBER>',`

`to: '<INSERT DESINATION PHONE NUMBERS>'`


## Installation

**NOTE:** You will need Node v18 installed which you can find here: https://nodejs.org/en/download

1. Download Project Zip and Extract contents to working directory

2. Install alertix with NPM. Open your terminal and locate the directory of the project and install the dependencies:

```bash
  cd alertix
  npm install
```

3. Run Script

```bash
  node index.js <INSERT LINK TO CONCERT>
```
