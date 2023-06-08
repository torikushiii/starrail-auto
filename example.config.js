const STAMINA_CHECK = false; // Set to true to enable stamina check
const DISCORD_WEBHOOK = null; // Discord webhook URL to send notification to
const COOKIES = [
	{
		uid: 123, // UID of the in-game account
		cookie: "", // Cookie of the account
		threshold: 170 // Stamina threshold to notify
	},
	{
		uid: null, // null UID will be ignored from stamina check but will still be checked in
		cookie: "",
		threshold: 50
	}
];

const CRON_TIMINGS = {
	CHECK_IN: "0 0 0 * * *", // Check in at 00:00:00 everyday
	STAMINA_CHECK_INTERVAL: "0 */30 * * * *" // Check stamina every 30 minutes
};

export default {
	STAMINA_CHECK,
	DISCORD_WEBHOOK,
	COOKIES,
	CRON_TIMINGS
};
