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

		for (const data of checkInResult) {
			const message = (data.result === "OK")
				? `[Account ${data.account}] Check-in successful: ${data.award.name} x${data.award.count}`
				: `[Account ${data.account}] ${data.result}`;

			sr.Logger.info(message);
		}

		if (sr.Discord && sr.Discord.active) {
			const embed = sr.Discord.generateEmbed(checkInResult, { checkIn: true });
			await sr.Discord.send(embed);
		}

		if (sr.Telegram && sr.Telegram.active) {
			const message = sr.Telegram.formatMessage(checkInResult, { checkIn: true });
			await sr.Telegram.send(message);
		}
	})
};
