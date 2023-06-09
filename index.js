import { CronJob } from "cron";
import config from "./config.js";
import logger from "./lib/winston.js";
import DiscordClass from "./lib/discord.js";
import Stamina from "./lib/apps/stamina.js";
import CheckIn from "./lib/apps/check-in.js";

const cronjobs = async () => {
	const TIMINGS = {
		CHECK_IN: config.CRON_TIMINGS.CHECK_IN ?? "0 0 0 * * *",
		STAMINA_CHECK_INTERVAL: config.CRON_TIMINGS.STAMINA_CHECK_INTERVAL ?? "0 */30 * * * *"
	};
	
	let Discord = null;
	if (config.DISCORD_WEBHOOK) {
		Discord = new DiscordClass({ webhook: config.DISCORD_WEBHOOK });
	}

	const checkIn = new CheckIn({ cookies: config.COOKIES });

	const checkInJob = new CronJob(TIMINGS.CHECK_IN, async () => {
		const result = await checkIn.checkAndSign();
		if (result.message.length === 0) {
			return;
		}

		if (Discord) {
			await Discord.send(result.message);
		}
	});

	checkInJob.start();

	if (config.STAMINA_CHECK) {
		const stamina = new Stamina({ accounts: config.COOKIES });
		const staminaJob = new CronJob(TIMINGS.STAMINA_CHECK_INTERVAL, async () => {
			const result = await stamina.run();
			if (result.length === 0) {
				return;
			}

			if (Discord) {
				for (const message of result) {
					await Discord.send(message, { skipEmbed: true });
				}
			}
		});

		staminaJob.start();
	}

	logger.info("All cronjobs started successfully!");
};

if (process.argv.includes("--sign")) {
	logger.info("Running check-in...");
	const checkIn = new CheckIn({ cookies: config.COOKIES });
	const result = await checkIn.checkAndSign();
	if (result.message.length === 0) {
		logger.info("No check-in required.");
	}
	else if (config.DISCORD_WEBHOOK !== null) {
		logger.info("Sending check-in notification...");
		const Discord = new DiscordClass({ webhook: config.DISCORD_WEBHOOK });
		await Discord.send(result.message);
	}

	logger.info("Check-in completed!");
	
	process.exit(0);
}

logger.info("Starting cronjobs...");
cronjobs();
