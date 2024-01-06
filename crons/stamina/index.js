module.exports = {
	name: "stamina",
	expression: sr.Config.get("STAMINA_CHECK_INTERVAL") ?? "0 */30 * * * *",
	description: "Check for your stamina and notify you when it's almost full",
	code: (async function announceStamina () {
		const skipCheck = sr.Config.get("PERSISTENT_STAMINA") ?? false;
		const staminaResult = await sr.Stamina.checkAndRun({ skipCheck });
		if (staminaResult.length === 0) {
			return;
		}

		const data = [];
		for (const message of staminaResult) {
			const { currentReserveStamina, isReserveStaminaFull } = message;
			if (isReserveStaminaFull) {
				const { uid, username } = message;

				sr.Logger.info(`[${uid}] ${username} Reserve Stamina is full: ${currentReserveStamina}`);

				if (sr.Discord && sr.Discord.active) {
					const embed = await sr.Discord.prepareMessage(message, { reserve: true });
					await sr.Discord.send(embed);
				}

				if (sr.Telegram && sr.Telegram.active) {
					const text = `⚠️ [${uid}] ${username} Reserve Stamina is full: ${currentReserveStamina} ⚠️`;
					await sr.Telegram.send(text);
				}
			}

			const {
				uid,
				username,
				currentStamina,
				maxStamina,
				delta
			} = message;

			if (!currentStamina || !maxStamina) {
				continue;
			}

			sr.Logger.info(`[${uid}] ${username} Stamina is above the threshold: ${currentStamina}/${maxStamina} (${delta})`);

			data.push(...staminaResult);
		}

		if (data.length === 0) {
			return;
		}

		if (sr.Discord && sr.Discord.active) {
			for (const message of data) {
				const embed = await sr.Discord.prepareMessage(message, { stamina: true });
				await sr.Discord.send(embed);
			}
		}

		if (sr.Telegram && sr.Telegram.active) {
			for (const message of data) {
				const text = sr.Telegram.prepareMessage(message, { stamina: true });
				await sr.Telegram.send(text);
			}
		}
	})
};
