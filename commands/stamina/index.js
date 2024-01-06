module.exports = {
	name: "stamina",
	description: "Check for Trailblazer stamina and see how long until it capped",
	run: async (context) => {
		const staminaResult = await sr.Stamina.checkAndRun({ checkOnly: true });
		if (context.append.platform.id === 1) {
			const messages = [];
			for (const message of staminaResult) {
				const { uid, currentStamina, maxStamina, delta } = message;
				messages.push(`[${uid}] Current stamina: ${currentStamina}/${maxStamina} (${delta})`);
			}

			return {
				success: true,
				reply: messages.join("\n")
			};
		}
	}
};
