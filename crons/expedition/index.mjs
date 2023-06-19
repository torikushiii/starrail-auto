export const definitions = {
	name: "expedition",
	expression: sr.Config.get("EXPEDITION") ?? "0 */30 * * * *",
	description: "Check for characters in expedition and notify you when they are done",
	code: (async function announceExpedition () {
		const skipCheck = sr.Config.get("PERSISTENT_EXPEDITION") ?? false;
		const expeditionResult = await sr.Expedition.checkAndRun({ skipCheck });
		if (expeditionResult.length === 0) {
			return;
		}

		for (const data of expeditionResult) {
			const { uid } = data;
			sr.Logger.info(`[${uid}] All expedition has been completed!`);
		}

		if (sr.Discord && sr.Discord.active) {
			for (const data of expeditionResult) {
				const embed = sr.Discord.prepareMessage(data, { expedition: true });
				await sr.Discord.send(embed);
			}
		}
        
		if (sr.Telegram && sr.Telegram.active) {
			for (const data of expeditionResult) {
				await sr.Telegram.send(`🗺️ Account: ${data.uid}\nAll expedition are done!`);
			}
		}
	})
};
