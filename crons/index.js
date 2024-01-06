const { CronJob } = require("cron");

const CodeRedeem = require("./check-code-redeem/index.js");
const CheckIn = require("./check-in/index.js");
const CheckInChecker = require("./check-in-checker/index.js");
const DailyReminder = require("./dailies-reminder/index.js");
const Expedition = require("./expedition/index.js");
const Stamina = require("./stamina/index.js");
const WeekliesReminder = require("./weeklies-reminder/index.js");

const definitions = [
	CodeRedeem,
	CheckIn,
	CheckInChecker,
	DailyReminder,
	Expedition,
	Stamina,
	WeekliesReminder
];

const initCrons = (options = {}) => {
	const { disableAll, blacklist = [], whitelist = [] } = options;
	if (disableAll) {
		return;
	}
	else if (whitelist.length > 0 && blacklist.length > 0) {
		throw new Error("Cannot use both whitelist and blacklist");
	}

	const crons = [];
	for (const definition of definitions) {
		if (blacklist.length > 0 && blacklist.includes(definition.name)) {
			continue;
		}
		else if (whitelist.length > 0 && !whitelist.includes(definition.name)) {
			continue;
		}

		const cron = {
			name: definition.name,
			description: definition.description,
			code: definition.code
		};

		const job = new CronJob(definition.expression, () => cron.code(cron));
		job.start();

		cron.job = job;
		crons.push(cron);
	}

	return crons;
};

module.exports = {
	initCrons
};
