import { handleFlag } from "./lib/flag-handler.js";

const importModule = async (module, path) => {
	const { definitions } = await import(`./${path}/index.mjs`);
	await module.importData(definitions);
};

(async function () {
	const { default: initObjects } = await import("./core/index.js");
	globalThis.sr = await initObjects();

	const { default: commandData } = await import("./commands/index.js");
	const commands = await commandData;
	await sr.Command.importData(commands.definitions);

	await handleFlag(process.argv);
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

		try {
			sr[platform] = new Controller.default();
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
