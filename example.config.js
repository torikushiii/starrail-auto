const config = {
	staminaCheck: false, // Set to true to enable stamina check (will send notification if stamina is above the threshold)
	cookies: [
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
	notification: {
		enabled: false, // Set to true to enable notification
		skipCheck: false, // Set to true if you want to keep sending notification even if stamina is above the threshold and capped.
		service: {
			discord: {
				enabled: false, // Set to true to enable Discord notification
				webhook: "" // Discord webhook URL
			},
			telegram: {
				enabled: false, // Set to true to enable Telegram notification
				chatId: 123, // Telegram chat ID, use @getmyid_bot to get your chat ID
				token: "", // Telegram bot token
				disableNotification: false // Revoke notification (sound, vibration, etc.)
			}
		}
	},
	cronTimings: {
		CHECK_IN: "0 0 0 * * *", // Check in daily at 00:00:00
		STAMINA_CHECK_INTERVAL: "0 */30 * * * *" // Check stamina every 30 minutes
	}
};

export default config;
