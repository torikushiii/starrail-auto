module.exports = {
	name: "check-in",
	expression: sr.Config.get("CHECK_IN") ?? "0 0 0 * * *",
	description: "Run daily check-in every day at midnight",
	code: (async function announceCheckIn () {
		const checkInResult = await sr.CheckIn.checkAndSign();
		if (checkInResult.length === 0) {
			return;
		}

		for (const data of checkInResult) {
			const message = (data.result === "OK")
				? `[Account ${data.uid}] ${data.username} Check-in successful: ${data.award.name} x${data.award.count}`
				: `[Account ${data.uid}] ${data.username} ${data.result}`;

			sr.Logger.info(message);
		}

		if (sr.Discord && sr.Discord.active) {
			await sr.Discord.prepareMessage(checkInResult, { checkIn: true });
		}

		if (sr.Telegram && sr.Telegram.active) {
			const message = sr.Telegram.prepareMessage(checkInResult, { checkIn: true });
			await sr.Telegram.send(message);
		}
	})
};
