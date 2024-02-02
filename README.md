<h1 align="center">
    <img width="120" height="120" src="https://i.imgur.com/qidPCBf.png" alt=""><br>
    Honkai: Star Rail Helper
</h1>

<p align="center">
   <img src="https://img.shields.io/badge/NodeJS-20.2.0-green">
   <img src="https://img.shields.io/github/license/torikushiii/starrail-auto">
   <img src="https://img.shields.io/github/stars/torikushiii/starrail-auto">
   <a href="https://app.codacy.com/gh/torikushiii/starrail-auto/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade"><img src="https://app.codacy.com/project/badge/Grade/8bf05ddfba214bd2b7dbdcd28600e2c9"/></a>
</p>

![Alt](https://repobeats.axiom.co/api/embed/258364749d69138ce925035dfe396bac085e8f1f.svg "Repobeats analytics image")

# Honkai: Star Rail Helper

A multi-purpose tool for the Honkai Impact: Star Rail that can be used to automate the daily check-in process, check stamina and expedition status.

# Services
If you don't want to use Node.js and simply only want to use it for auto check-in, you can use one of the following services:
- [Google Apps Script](https://github.com/torikushiii/starrail-auto/tree/master/services/google-script)

# Features
- [x] Auto Check-in
    # ![image](https://github.com/torikushiii/starrail-auto/assets/21153445/08635e37-9d78-433d-9e90-1c0ae0fd6242)
- [x] Multiple accounts
- [x] Stamina check (Node only)
    - Will send you notification if your stamina is above set [threshold](https://i.imgur.com/EFPVkI9.png) (default: 170)
- [x] Expedition check (Node only)
    - Will send you notification if your expedition is [done](https://i.imgur.com/qjFWrdl.png)
- [x] Reminders (Node only)
    - Dailies
        - Remind you to do your [daily commission](https://i.imgur.com/5kEqkTG.png) every day at 09:00 PM or your specified time (Only if you haven't done it yet)
    - Weeklies
        - Remind you to do your [weekly boss](https://i.imgur.com/0aoC7bu.png) every your specified time or Sunday 09:00 PM (Only if you haven't done it yet)
        - Remind you to do your Simulated Universe points every your specified time or Sunday 09:00 PM (Only if you haven't done it yet)
- [x] Code Redeem (Node only)
    - Will send you notification if there's a new code available
    - Will automatically redeem the code for you
- [x] Discord notifications
- [x] Telegram notifications (Node only)
    - Commands
        - [x] Check stamina
        - [x] Check expedition status

# Pre-requisites
- [Node.js](https://nodejs.org/en/) (You will need to run your computer 24/7 if you want to use this, Google Apps Script is recommended if you don't want to run your computer 24/7 but you can only use it for auto check-in)

# Installation
1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Create a `config.json` or rename `default.config.json` to `config.json`.
4. Follow the instructions in the `config.json` file.

# Usage
1. Go to the Daily Check-In page [here](https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311).
2. Log in with your miHoYo account.
3. Open the browser console (F12).
4. Click on the "Application" tab.
5. Type "lt" in the "Filter" bar.
   ![image](https://github.com/torikushiii/starrail-auto/assets/21153445/fa902bdd-d165-4a8b-869b-860837ecee30)
6. Copy name and value (ltoken_v2 and ltuid_v2) and put it in your newly created `config.json` or `default.config.json` file.
8. Run `index.js` with `node index.js` if you want to run it indefinitely everytime the daily reset occurs.
9. Run `index.js` with `node index.js --sign` if you want to run it once.
10. Additonal arguments:
    - `--stamina` to check all accounts stamina. (You need to set your in-game `uid` for it to work)
    - `--expedition` to check all accounts expedition status. (You need to set your in-game `uid` for it to work)
    - `--help` to show the help menu.

# Notifications
For Discord notifications or Telegram setup, refer to this folder: [setup](https://github.com/torikushiii/starrail-auto/tree/master/setup)

# Docker
To start the project, you can use Docker.

### How to run
For the application to work, the configuration file must be mounted under `/app/config.json` or `/app/default.config.json`, respectively (refer to `docker-compose.yml` for details).

1. Prepare the configuration file as described in the [Installation](#installation) and [Usage](#usage) sections.
2. Build the base image with `docker compose build` or without cache with `docker compose build --no-cache`.
3. Start the container with `docker compose up -d`.
4. Check logs with `docker compose logs -f`.

# Makefile
There is a handy `Makefile` that can be used with [GNU Make](https://www.gnu.org/software/make/) or [GNU Make for Windows](https://community.chocolatey.org/packages/make).

List of generally used commands:
- `make run` - Start application.
- `make run-once` - Start application once.
- `make install` - Download node modules.
- `make start` - Start the Docker container instance.
- `make stop` - Stop the Docker container instance.
- `make logs` - Read logs generated by the Docker container.

# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. If there's any bugs, please open an issue.

**New here?**

To get started, fork the repo, make your changes, add, commit and push your changes to your fork, then come back here and open a pull request. If you're new to GitHub, [this tutorial](https://www.freecodecamp.org/news/how-to-make-your-first-pull-request-on-github-3#let-s-make-our-first-pull-request-) may help.

You can support the project by giving it a star, sharing it with your friends, contributing to the project, and report any bugs you find.

# Buy me a coffee
If this repo is useful to you, you can buy me a coffee to support me. Thank you!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/torikushiii)

- [Ko-fi](https://ko-fi.com/torikushiii)
- [Trakteer](https://trakteer.id/torikushiii)