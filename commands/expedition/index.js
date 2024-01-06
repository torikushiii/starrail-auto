module.exports = {
	name: "expedition",
	description: "Check for characters in expedition and see how long until they are done",
	run: async (context) => {
		const expeditionResult = await sr.Expedition.checkAndRun({ checkOnly: true });
		if (context.append.platform.id === 1) {
			const messages = [];
			for (const data of expeditionResult) {
				const { uid } = data;
				if (!data?.expeditions) {
					messages.push(`[${uid}] No expedition is running or all expedition has been completed!`);
					continue;
				}

				const expedition = data.expeditions.map(item => {
					const { delta } = item;
					return `📈 Remaining time: ${delta}`;
				}).join("\n");

				messages.push(`[${uid}] Expedition is running!\n${expedition}`);
			}

			return {
				success: true,
				reply: messages.join("\n")
			};
		}
	}
};
