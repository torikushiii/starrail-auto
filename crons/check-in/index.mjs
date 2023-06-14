import config from "../../config.js";

export const definitions = {
	name: "check-in",
	expression: config.cronTimings.CHECK_IN,
	description: "Run daily check-in every day at midnight",
	code: (async function announceCheckIn () {
		const checkInResult = await sr.CheckIn.checkAndSign();
		if (checkInResult.length === 0) {
			return;
		}

		if (sr.Discord && sr.Discord.active) {
			const embed = sr.Discord.generateEmbed(checkInResult);
			await sr.Discord.send(embed);
		}

		if (sr.Telegram && sr.Telegram.active) {
			const message = sr.Telegram.formatMessage(checkInResult, { checkIn: true });
			await sr.Telegram.send(message);
		}
	})
};
