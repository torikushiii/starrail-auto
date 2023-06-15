import config from "./config.js";

const importModule = async (module, path) => {
	const { definitions } = await import(`./${path}/index.mjs`);
	await module.importData(definitions);
};

(async function () {
	const { default: initObjects } = await import("./core/index.js");
	globalThis.sr = await initObjects();

	// Make a separate handler for this
	const flag = process.argv[2];
	if (flag !== "--sign" && flag !== "--stamina") {
		sr.Logger.error("Invalid flag. Please use --sign or --stamina");
		process.exit(1);
	}

	if (flag === "--sign") {
		const checkInResult = await sr.CheckIn.checkAndSign();
		for (const data of checkInResult) {
			const message = (data.result === "OK")
				? `[Account ${data.account}] Check-in successful: ${data.award.name} x${data.award.count}`
				: `[Account ${data.account}] ${data.result}`;

			sr.Logger.info(message);
		}

		process.exit(0);
	}
	else if (flag === "--stamina") {
		const staminaResult = await sr.Stamina.checkAndRun({ checkOnly: true });
		for (const message of staminaResult) {
			const { uid, currentStamina, maxStamina, delta } = message;
			sr.Logger.info(`[${uid}] Stamina is above the threshold: ${currentStamina}/${maxStamina} (${delta})`);
		}

		process.exit(0);
	}

	await importModule(sr.Cron, "crons");

	const initialPlatforms = [
		"Discord",
		"Telegram"
	];

	for (const platform of initialPlatforms) {
		let Controller = null;
		try {
			Controller = await import(`./controllers/${platform.toLocaleLowerCase()}.js`);
		}
		catch (e) {
			console.error(`Failed to load ${platform} controller`, e);
			continue;
		}

		const options = config.notification.service[platform.toLocaleLowerCase()];
		try {
			sr[platform] = new Controller.default(options);
		}
		catch (e) {
			console.error(`Failed to initialize ${platform} controller`, e);
			continue;
		}
	}

	await sr.Account.validate();
	sr.Logger.info("All accounts have been validated");

	process.on("unhandledRejection", async (reason) => {
		if (!(reason instanceof Error)) {
			return;
		}

		console.error(reason);
	});
})();
