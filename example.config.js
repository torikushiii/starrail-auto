const config = {
	COOKIES: [
		{
			uid: 123, // Your in-game UID
			cookie: "",
			threshold: 170 // Stamina threshold to send notification
		},
		{
			uid: null, // null UID will be ignored from stamina check but will still be checked in daily
			cookie: "",
			threshold: 170
		}
	],
	STAMINA_CHECK: true, // Set to true to enable stamina check
	PERSISTENT_EXPEDITION: false, // Set to true if you want to keep sending notification
	PERSISTENT_STAMINA: true, // Set to true if you want to keep sending notification even if stamina is above the threshold and capped.
	CHECK_CODE_REDEEM: true, // Set to true to enable code check (THIS ONLY CHECK FOR NEW GLOBAL CODES)
	DISCORD_WEBHOOK: null, // Discord webhook URL
	TELEGRAM_CHAT_ID: null, // Telegram chat ID, use @getmyid_bot to get your chat ID
	TELEGRAM_TOKEN: null, // Telegram bot token
	TELEGRAM_DISABLE_NOTIFICATION: false, // Revoke notification (sound, vibration, etc.)
	CHECK_IN: "0 0 0 * * *", // Check in daily at 00:00:00
	EXPEDITION: "0 */30 * * * *", // Check expedition every 30 minutes
	STAMINA_CHECK_INTERVAL: "0 */30 * * * *" // Check stamina every 30 minutes
};

export default config;
