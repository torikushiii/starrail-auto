import config from "../../config.js";

export const definitions = {
	name: "stamina",
	expression: config.cronTimings.STAMINA_CHECK_INTERVAL,
	description: "Check for your stamina and notify you when it's almost full",
	code: (async function announceStamina () {
		const staminaResult = await sr.Stamina.checkAndRun(false , { skipCheck: config.notification.skipCheck });
		if (staminaResult.length === 0) {
			return;
		}

		if (sr.Discord && sr.Discord.active) {
			for (const message of staminaResult) {
				await sr.Discord.send(message);
			}
		}

		if (sr.Telegram && sr.Telegram.active) {
			const message = sr.Telegram.formatMessage(staminaResult, { stamina: true });
			await sr.Telegram.send(message);
		}
	})
};
