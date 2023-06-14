<h1 align="center">
    <img width="120" height="120" src="https://i.imgur.com/qidPCBf.png" alt=""><br>
    Honkai: Star Rail Check-In Helper
</h1>

<p align="center">
   <img src="https://img.shields.io/badge/NodeJS-20.2.0-green">
   <img src="https://img.shields.io/github/license/torikushiii/starrail-auto">
   <img src="https://img.shields.io/github/stars/torikushiii/starrail-auto">
   <a href="https://app.codacy.com/gh/torikushiii/starrail-auto/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade"><img src="https://app.codacy.com/project/badge/Grade/8bf05ddfba214bd2b7dbdcd28600e2c9"/></a>
</p>

![Alt](https://repobeats.axiom.co/api/embed/258364749d69138ce925035dfe396bac085e8f1f.svg "Repobeats analytics image")

# Daily Check-In

[Daily Check-In](https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311)

# Services
If you don't want to use Node.js, you can use one of the following services:
- [Google Apps Script](https://github.com/torikushiii/starrail-auto/tree/master/services/google-script)

# Features
- [x] Auto Check-in
- [x] Stamina check (Node only)
- [x] Discord notifications
- [x] Telegram notifications (Node only)
- [x] Multiple accounts

# Pre-requisites
- [Node.js](https://nodejs.org/en/)

# Installation
1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Create a `config.js` or rename `example.config.js` to `config.js`.
4. Follow the instructions in the `config.js` file.

# Usage
1. Go to the Daily Check-In page [here](https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311).
2. Log in with your miHoYo account.
3. Open the browser console (F12).
4. Click on the "Console" tab.
5. Type in `document.cookie` in the console and press Enter.
6. Copy the output from the console.
   ![](https://i.imgur.com/hFCL4yN.png)
7. Paste the output into `cookies` property in the `config.js` file.
8. Fill in the `webhook` field if you want to receive a Discord notification when the check-in is successful.
9. Run `index.js` with `node index.js` if you want to run it indefinitely everytime the daily reset occurs.
10. Run `index.js` with `node index.js --sign` if you want to run it once.

# Notifications
For Discord notifications or Telegram setup, refer to this folder: [setup](https://github.com/torikushiii/starrail-auto/tree/master/setup)

# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. If there's any bugs, please open an issue.
