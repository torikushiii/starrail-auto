# Discord Webhooks
This is an **OPTIONAL** feature. If you want to receive a Discord notification when the check-in is successful, you can create a Discord webhook and add it to the `config.js` file.

1. Go to edit channel settings. (Create your own server if you don't have one.)
   ![](https://i.imgur.com/FWfK3My.png)
2. Go to the "Integrations" tab and click on "Create Webhook".
   ![](https://i.imgur.com/DnELZJl.png)
3. Create a name for your webhook and click on "Copy Webhook URL".
   ![](https://i.imgur.com/AkfTTBB.png)
4. Paste the URL into the `DISCORD_WEBHOOK` field at the `config.js` file.
5. Click on "Save Changes".
   ![](https://i.imgur.com/KFYeonU.png)
6. You should receive a Discord notification when the check-in is successful.
   ![](https://i.imgur.com/MOkfwrK.png)
7. And if you enable stamina check, you should receive a Discord notification when your stamina is above your set threshold and when it capped.
   ![](https://i.imgur.com/B1uDNiT.png)