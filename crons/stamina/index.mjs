export const definitions = {
	name: "stamina",
	expression: sr.Config.get("STAMINA_CHECK_INTERVAL") ?? "0 */30 * * * *",
	description: "Check for your stamina and notify you when it's almost full",
	code: (async function announceStamina () {
		const skipCheck = sr.Config.get("PERSISTENT_STAMINA") ?? false;
		const staminaResult = await sr.Stamina.checkAndRun({ skipCheck });
		if (staminaResult.length === 0) {
			return;
		}

		for (const message of staminaResult) {
			const { uid, currentStamina, maxStamina, delta } = message;
			sr.Logger.info(`[${uid}] Stamina is above the threshold: ${currentStamina}/${maxStamina} (${delta})`);
		}

		if (sr.Discord && sr.Discord.active) {
			for (const message of staminaResult) {
				const embed = sr.Discord.prepareMessage(message, { stamina: true });
				await sr.Discord.send(embed);
			}
		}

		if (sr.Telegram && sr.Telegram.active) {
			for (const message of staminaResult) {
				const text = sr.Telegram.prepareMessage(message, { stamina: true });
				await sr.Telegram.send(text);
			}
		}
	})
};
