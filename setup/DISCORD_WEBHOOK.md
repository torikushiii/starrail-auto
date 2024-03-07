# Discord Webhooks
This is an **OPTIONAL** feature. If you want to receive a Discord notification when the check-in is successful, you can create a Discord webhook and paste the value into the `config.json` file.

1. Go to edit channel settings. (Create your own server if you don't have one.)
   ![](https://i.imgur.com/FWfK3My.png)
2. Go to the "Integrations" tab and click on "Create Webhook".
   ![](https://i.imgur.com/DnELZJl.png)
3. Create a name for your webhook and click on "Copy Webhook URL".
   ![](https://i.imgur.com/AkfTTBB.png)
4. Paste the URL into the `DISCORD_WEBHOOK` field at the `default.config.json` or `config.json` file.
   ![](https://github.com/torikushiii/starrail-auto/assets/21153445/88e608bf-851c-416c-a724-4c41a56a1737)
   - And it would look like this
   ```json
   {
       "DISCORD_WEBHOOK": "https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKLMN1234567890"
   }
   ```
5. Click on "Save Changes".
   ![](https://i.imgur.com/KFYeonU.png)
6. You should receive a Discord notification when the check-in is successful.
   ![](https://i.imgur.com/MOkfwrK.png)
7. And if you enable stamina check, you should receive a Discord notification when your stamina is above your set threshold and when it capped.
   ![](https://i.imgur.com/B1uDNiT.png)