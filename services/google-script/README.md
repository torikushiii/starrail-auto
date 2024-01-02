# Honkai: Star Rail Check-In Helper

[Daily Check-In](https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311)

# Contents
- [Pre-requisites](#pre-requisites)
- [Setting-up](#setting-up)
- [Running Automatically](#trigger)

# Pre-requisites
- Google Account

# Setting-up
1. Go to [Google Apps Script](https://script.google.com/home).
2. Create a new project.
    ![](https://i.imgur.com/y3FgPUV.png)
3. You will be greeted with this screen, delete the contents of `myFunction` and click on "Untitled project" to rename it.
    ![](https://i.imgur.com/4dRgXLe.png)
4. Copy the contents of `index.js` and paste it into the editor.
    ![](https://i.imgur.com/ZaA2oSX.png)
5. Follow the [Getting your cookie](#getting-your-cookie) instruction.
6. Add your cookie to the code
    ![](https://github.com/torikushiii/starrail-auto/assets/21153445/4aa9c2ab-ff47-4de3-a93c-2ba53310d1c8)
7. Add `DISCORD_WEBHOOK` with your Discord webhook (optional).
8. Click on save icon "Run" to run it once.
    ![](https://i.imgur.com/SvNODZL.png)
9. When first running the script, you will be prompted to authorize the script.
    ![](https://i.imgur.com/igXjtkO.png)
10. Click on "Review Permissions".
11. Choose your Google account if prompted.
12. You will be prompted to allow the script to access your Google account.
    ![](https://i.imgur.com/n7gsH6o.png)
13. Click on "Allow".
14. After that when you run the script, the Execution log will show the output.
    ![](https://i.imgur.com/KFGR003.png)

# Getting your cookie
1. Go to the Daily Check-In page [here](https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311).
2. Log in with your miHoYo account.
3. Open the browser console (F12).
4. Click on the "Application" tab.
5. Type "lt" in the "Filter" bar.
   ![image](https://github.com/torikushiii/starrail-auto/assets/21153445/fa902bdd-d165-4a8b-869b-860837ecee30)
6. Copy name and value (ltoken_v2 and ltuid_v2) and put it in your `config.js` file like this format `name=value;`
   - Remember to put "; (semicolon)" at every the end of `value`, e.g `ltoken_v2=abc; ltuid_v2=123`
7. Paste it into the "Value" field for "COOKIE" in the "Script properties" section.
   - **IF YOU WANT TO RUN IT WITH MULTIPLE ACCOUNTS, SEPARATE THE COOKIES WITH A HASH (#).**
   - **EXAMPLE: `COOKIE=cookie1#cookie2#cookie3`**
8. Click on "Save script properties".

# Trigger
If you want to automate the script, you can add a trigger to run it daily.
1. Click on the "Triggers" icon.
    ![](https://i.imgur.com/hAjfBhr.png)
2. Click on "Add Trigger".
    ![](https://i.imgur.com/WCVRpKA.png)
3. Choose the following settings:
    - Choose which function to run: `run`
    - Choose which deployment should run: `Head`
    - Select event source: `Time-driven`
    - Select type of time based trigger: `Day timer`
    - Select time of day: `Midnight to 1am` or any time when the check-in resets
    ![](https://i.imgur.com/HSDge0k.png)
4. Click on "Save".
