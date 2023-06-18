/* eslint-disable no-fallthrough */

const help = `
Usage: node index.js [OPTIONS] [ARGS]...

	Honkai: Star Rail Helper

Options:
	-h, --help
		Show this help message and exit.

	-c, --sign
		Run auto check-in for all accounts.
	
	-s, --stamina
		Show all accounts current stamina and when does it cap.

	-e, --expedition
		Show all accounts current expedition status.
`;

export const handleFlag = async (argv) => {
	const flag = argv[2];
	switch (flag) {
		case "--help": {
			console.log(help);
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
