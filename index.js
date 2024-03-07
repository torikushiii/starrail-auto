const Account = require("./classes/account.js");
const CheckIn = require("./classes/check-in.js");
const Command = require("./classes/command.js");
const Config = require("./classes/config.js");
const Expedition = require("./classes/expedition.js");
const Stamina = require("./classes/stamina.js");

const Error = require("./objects/error.js");

const Got = require("./singletons/got.js");
const Logger = require("./singletons/logger.js");
const Utils = require("./singletons/utils.js");

/* eslint-disable no-fallthrough */
const handleFlags = async (argv) => {
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
					? `[Account ${data.uid}] Check-in successful: ${data.award.name} x${data.award.count}`
					: `[Account ${data.uid}] ${data.result}`;

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

let configData;
try {
	configData = require("./config.json");
}
catch {
	try {
		configData = require("./default.config.json");
	}
	catch {
		throw new Error({ message: "No default or custom config file found." });
	}
}

(async () => {
	globalThis.sr = {
		Error,
		Logger,
		Command,
		
		Config: await Config,

		Got: await Got,
		Utils: new Utils()
	};

	if (!configData.modules.commands.disableAll) {
		const { loadCommands } = require("./commands/index.js");
		const commands = await loadCommands();

		await Command.importData(commands.definitions);
	}

	Config.load(configData.config);

	globalThis.sr = {
		...sr,
		Account: await Account.initialize(configData.accounts)
	};

	const { initCrons } = require("./crons/index.js");
	initCrons(configData.modules.crons);

	globalThis.sr = {
		...sr,
		CheckIn: await CheckIn.initialize(),
		Expedition: await Expedition.initialize(),
		Stamina: await Stamina.initialize()
	};

	await handleFlags(process.argv);

	const platforms = [
		"Discord",
		"Telegram"
	];

	for (const platform of platforms) {
		let Controller = null;
		try {
			Controller = require(`./controllers/${platform.toLowerCase()}.js`);
		}
		catch (e) {
			console.error(`Failed to load ${platform} controller:`, e);
			continue;
		}

		try {
			sr[platform] = new Controller();
		}
		catch (e) {
			console.error(`Failed to initialize ${platform} controller:`, e);
			continue;
		}
	}

	process.on("unhandledRejection", async (reason) => {
		if (!(reason instanceof Error)) {
			return;
		}

		console.error("Rejected promise", reason);
	});
})();
