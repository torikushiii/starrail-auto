import config from "../../config.js";

export const definitions = {
	name: "expedition",
	expression: config.cronTimings.EXPEDITION,
	description: "Check for characters in expedition and notify you when they are done",
	code: (async function announceExpedition () {
		const expiditionResult = await sr.Expedition.checkAndRun({ skipCheck: config.notification.skipCheck });
		if (expiditionResult.length === 0) {
			return;
		}

		for (const data of expiditionResult) {
			const { uid } = data;
			sr.Logger.info(`[${uid}] All expedition has been completed!`);
		}

		if (sr.Discord && sr.Discord.active) {
			for (const data of expiditionResult) {
				const embed = sr.Discord.prepareMessage(data, { expedition: true });
				await sr.Discord.send(embed);
			}
		}
        
		if (sr.Telegram && sr.Telegram.active) {
			for (const data of expiditionResult) {
				await sr.Telegram.send(`🗺️ Account: ${data.uid}\nAll expedition are done!`);
			}
		}
	})
};
