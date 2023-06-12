import { CronJob } from "cron";
import config from "./config.js";
import logger from "./lib/winston.js";
import Stamina from "./lib/apps/stamina.js";
import CheckIn from "./lib/apps/check-in.js";
import NotificationClass from "./lib/notification.js";

const cronjobs = async () => {
	const TIMINGS = {
		CHECK_IN: config.cronTimings.CHECK_IN ?? "0 0 0 * * *",
		STAMINA_CHECK_INTERVAL: config.cronTimings.STAMINA_CHECK_INTERVAL ?? "0 */30 * * * *"
	};

	let Notification;
	let sendNotification = false;
	const { notification } = config;
	if (notification.enabled) {
		const { service } = notification;
		if (service.discord.enabled || service.telegram.enabled) {
			Notification = new NotificationClass(config.notification.service);
			sendNotification = true;
		}
	}
	
	const checkIn = new CheckIn({ cookies: config.cookies });
	const checkInJob = new CronJob(TIMINGS.CHECK_IN, async () => {
		const result = await checkIn.checkAndSign();
		if (result.message.length === 0) {
			return;
		}

		if (sendNotification) {
			const { service } = config.notification;
			if (service.discord.enabled) {
				await Notification.send("discord", result.message);
			}

			if (service.telegram.enabled) {
				await Notification.send("telegram", result.message, { checkIn: true });
			}
		}
	});

	checkInJob.start();

	if (config.staminaCheck) {
		const stamina = new Stamina({ accounts: config.cookies });
		const staminaJob = new CronJob(TIMINGS.STAMINA_CHECK_INTERVAL, async () => {
			const result = await stamina.run(false, { skipCheck: config.notification.skipCheck });
			if (result.length === 0) {
				return;
			}

			if (sendNotification) {
				const { service } = config.notification;
				if (service.discord.enabled) {
					for (const message of result) {
						await Notification.send("discord", message, { skipEmbed: true });
					}
				}

				if (service.telegram.enabled) {
					await Notification.send("telegram", result, { stamina: true });
				}
			}
		});

		staminaJob.start();
	}

	logger.info("All cronjobs started successfully!");
};

if (process.argv[2] === "--sign") {
	logger.info("Running check-in...");
	const checkIn = new CheckIn({ cookies: config.cookies });
	const result = await checkIn.checkAndSign();
	if (result.message.length === 0) {
		logger.info("No check-in required.");
	}

	logger.info("Check-in completed!");
	
	process.exit(0);
}
else if (process.argv[2] === "--stamina") {
	logger.info("Running stamina check...");
	const stamina = new Stamina({ accounts: config.cookies });
	
	await stamina.run(true);

	logger.info("Stamina check completed!");

	process.exit(0);
}

logger.info("Starting cronjobs...");
cronjobs();
