/* eslint-disable no-fallthrough */
export const handleFlag = async (argv) => {
	const flag = argv[2];
	switch (flag) {
		case "--help": {
			sr.Logger.info("Available flags:");
			sr.Logger.info("--help: Show this message");
			sr.Logger.info("--sign: Check-in and sign");
			sr.Logger.info("--stamina: Check stamina");
			sr.Logger.info("--expedition: Check expedition");
			process.exit(0);
		}
		
		case "--sign": {
			const checkInResult = await sr.CheckIn.checkAndSign();
			for (const data of checkInResult) {
				const message = (data.result === "OK")
					? `[Account ${data.account}] Check-in successful: ${data.award.name} x${data.award.count}`
					: `[Account ${data.account}] ${data.result}`;

				sr.Logger.info(message);
			}

			process.exit(0);
		}

		case "--stamina": {
			const staminaResult = await sr.Stamina.checkAndRun({ checkOnly: true });
			for (const message of staminaResult) {
				const { uid, currentStamina, maxStamina, delta } = message;
				sr.Logger.info(`[${uid}] Current stamina: ${currentStamina}/${maxStamina} (${delta})`);
			}

			process.exit(0);
		}
		
		case "--expedition": {
			const expiditionResult = await sr.Expedition.checkAndRun({ checkOnly: true });
			for (const data of expiditionResult) {
				const { uid } = data;
				if (!data?.expeditions) {
					sr.Logger.info(`[${uid}] All expedition has been completed!`);
					continue;
				}

				for (const expedition of data.expeditions) {
					const { delta } = expedition;
					sr.Logger.info(`[${uid}] Remaining time: ${delta}`);
				}
			}

			process.exit(0);
		}
	}
};
