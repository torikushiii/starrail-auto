module.exports = {
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
			const { uid, username } = data;
			sr.Logger.info(`[${uid}] ${username} All expedition has been completed!`);
		}

		if (sr.Discord && sr.Discord.active) {
			for (const data of expeditionResult) {
				const embed = await sr.Discord.prepareMessage(data, { expedition: true });
				await sr.Discord.send(embed);
			}
		}
        
		if (sr.Telegram && sr.Telegram.active) {
			for (const data of expeditionResult) {
				await sr.Telegram.send(`🗺️ [${data.uid}] ${data.username}:\nAll expedition are done!`);
			}
		}
	})
};
