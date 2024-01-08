# Changelog

## 1/8/2024
- Minor: Bumped Telegram timeout to 5 seconds
- Minor: Fix error message in config file handling
- Bugfix: Added missing commands module at the config file
- Bugfix: Fixed typo from `thershold` to `threshold``

## 1/7/2024
- Major: Reworked codebase from ES6 to CommonJS

## 1/3/2024
- Bugfix: Added missing delay on unsuccessful request

## 1/2/2024
- Bugfix: Add delay after successful request

## 12/29/2023
- Major: Added `check-in-checker` to check if user has checked in or not to avoid missing check-in
- Minor: Add `getSignData` method to CheckIn class

## 12/28/2023
- Bugfix: Add await keyword to Discord message preparation

## 12/26/2023
- Minor: Updated Google Script instructions

## 12/25/2023
- Minor: Update account cookie regex to include ltuid_v2

## 12/22/2023
- Major: Reworked Discord embed notification
- Minor: Added icon property to award object
- Minor: Added `formattedAccountRegion` to utils
- Minor: Added method to get account by ID

## 12/8/2023
- Minor: Fixed auto redeemer does not work when there's new codes

## 11/17/2023
- Minor: Updated the regular expression used to extract the account ID from the cookie in the account class.

## 11/9/2023
- Minor: Removed log if there's no exchange group

## 11/4/2023
- Minor: Reworked new code checker and codes now check for hoyolab if there's any new codes too
- Minor: Added option to auto-redeem for codes in `config.js` and added function to automatically redeem new codes
- Minor: Added missing `REDEEM_CODE` property to `config.js` file

## 10/29/2023
- Major: Writed newly obtained redeem codes to `codes.js` file to avoid duplicate codes

## 9/16/2023
- Major: Initial implementation for checking if reserve stamina is full

## 8/21/2023
- Minor: Notification now display username of the account
- Bugfix: When expedition is done, it will now display the correct expedition name (#16)

## 7/20/2023
- Major: Added `daily` and `weekly` crons to check if user has done their daily and weekly tasks
- Minor: Moved all DS generators to `utils` singleton

## 7/9/2023
- Minor: When registering account with no `account_id` provided, it will still be registered with cookie provided but no account data such as `region`, `rank`, etc will be fetched.
- Bugfix: Fixed bug where when user provided cookie and there's no `account_id` in the cookie, it will throw an error (#13)

## 7/6/2023
- Major: Added `GenericRequestError` class to handle generic request error
- Major: Refactored `Account` class to get all account related data
- Minor: Improved `RequestError` error message
- Minor: Removed log when account is registered
- Minor: Check-in now returns proper account `UID`
- Minor: Moved Telegram got into custom `got` instance
- Minor: Removed unused `Error` at Telegram controller
- Minor: Added duplicate check when registering account

## 6/30/2023
- Major: Reworked command handler for future universal uses
- Bugfix: Code reedem cron didn't save the code properly

## 6/20/2023
- Major: Reworked `config` to class and for easier access to configs
- Minor: Defaulted all values to `false` on `config.js` file

## 6/19/2023
- Major: Added `utils` singleton and moved some of the `stamina` and `expedition` function to utils
- Major: Added cron to check for new codes (Currently only supports Global server codes)
- Minor: Modified help message for `flag-handler`
- Minor: Moved `formatTime` and `getAccountRegion` to `utils`
- Minor: Refactored notification codes check using optional chaining
- Bugfix: Fixed bug where notification kept being send even skipCheck is set to false (#10)
- Bugfix: Fixed wrong operetor given for expedtion check
- Bugfix: Fixed code redemption logic bug

## 6/17/2023
- Major: Telegram users now can use commands to check stamina, and check expedition status by using `/stamina` and `/expedition` respectively.
- Minor: Added `prepareMessage` function to prepare message for Telegram and Discord
- Minor: Typo fix for `expidition` to `expedition` at expedition cron
- Minor: Fix expedition completion check logic
- Minor: Added missing region for `CN/TW` server

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