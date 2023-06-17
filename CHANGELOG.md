# Changelog

## 6/17/2023
- Major: Added Telegram users now can use commands to check stamina, and check expedition status by using `/stamina` and `/expedition` respectively.
- Minor: Added `prepareMessage` function to prepare message for Telegram and Discord
- Minor: Typo fix for `expidition` to `expedition` at expedition cron
- Minor: Fix expedition completion check logic

## 6/16/2023
- Minor: Discord embed generator now accept `stamina` and `expedition` as a parameter to generate the embed
- Minor: Added missing argument handler for `--sign` and `--stamina` flag
- Minor: Removed flag validation since it can throw an error when other flags are used such as `--color` if you're using pm2
- Minor: Moved process flag handler to it's own function
- Minor: Added `checkOnly` option to expedition
- Minor: Renamed `flagHandler` to `flag-handler`
- Minor: Switched if statement to switch statement for `flag-handler`

## 6/15/2023
- Major: Moved `Discord`, `Telegram` to controllers folder
- Major: Added `Account` class to handle account related functions
- Major: Added template for classes
- Major: Added `cron` to handle cronjobs
- Major: Reworked script initialization to load all modules on startup and verify if the accounts are valid
- Major: Added core loader to load all core modules on startup
- Major: Added Expedition class to handle expedition related functions and notify user when all expedition is done
- Minor: Moved `check-in` and `stamina` to `hoyo` folder
- Minor: Removed `prefixUrl` from got
- Minor: Removed `Notification` class
- Minor: Removed `config` from telegram config
- Minor: Moved `error` class to objects folder
- Minor: Splitted cronjobs into their seperate folders
- Minor: Typo fix for `expidition` to `expedition`
- Minor: Added missing expedition cronjob config

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