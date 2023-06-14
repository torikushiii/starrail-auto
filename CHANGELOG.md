# Changelog

## 6/15/2023
- Major: Moved `Discord`, `Telegram` to controllers folder
- Major: Added `Account` class to handle account related functions
- Major: Added template for classes
- Major: Added `cron` to handle cronjobs
- Minor: Moved `check-in` and `stamina` to `hoyo` folder

## 6/12/2023
- Minor: Added `skipCheck` option to bypass `account.fired` check and will always send a notification.

## 6/11/2023
- Major: Fixed wrong license provided in the repo, followed correct license at the `package.json` file.
- Minor: Moved notifications setup to it's own respective folder.
- Minor: Update the variable name at README.md file.
- Minor: Removed unintended check for `--stamina` flag.
- Minor: Update Stamina class to dynamically determine server based on account's region.
- Minor: Misc updates to README.md file.
- Minor: Removed unintended if statement.
- Minor: Fixed `Stamina` class to fix account firing logic.
- Minor: Removed unintended `console.log`.

## 6/10/2023
- Major: Added `Telegram` support
- Minor: Added `--stamina` flag to allow user to check their current stamina.
- Minor: Small code refactor and code reorganization.
- Minor: Removed notifications when user is using flags.

## 6/9/2023
- Major: Reworked the entire check-in functions
- Major: Added custom error class to handle errors
- Major: Added stamina check to notify user when they are above threshold
- Minor: Moved config from using a `.env` file to a `config.js` file
- Minor: Added `skipEmbed` option to skip the embed when sending a message
- Minor: README typo fix
- Minor: Refactor Discord initialization in cronjobs function to handle if `DISCORD_WEBHOOK` is `null`