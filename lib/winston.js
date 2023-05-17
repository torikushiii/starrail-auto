import util from "util";
import chalk from "chalk";
import { createLogger, format, transports, addColors } from "winston";
const { combine, colorize, timestamp, printf } = format;

const levels = {
	colors: {
		info: "green",
		error: "underline bold red",
		debug: "bold magenta",
		warn: "yellow"
	}
};

const logFormat = printf(({ level, message, timestamp }) => `${chalk.magenta(timestamp)} [${level}]: ${message}`);

const winston = createLogger({
	format: combine(
		format((info) => {
			info.level = info.level.toUpperCase();
			return info;
		})(),
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss"
		}),
		colorize(),
		logFormat
	),
	transports: [new transports.Console({
		stderrLevels: ["error"],
		colorize: true
	})]
});

addColors(levels.colors);

const info = (...args) => {
	winston.info(...args);
};

const error = (...args) => {
	winston.error(...args);
};

const debug = (...args) => {
	winston.debug(...args);
};

const warn = (...args) => {
	winston.warn(...args);
};

const json = (...args) => {
	winston.info(util.inspect(...args));
};

export default {
	info,
	error,
	debug,
	warn,
	json
};
