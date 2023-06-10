import Error from "./error.js";
import Discord from "./discord.js";
import Telegram from "./telegram.js";
import ClassTemplate from "./template.js";

export default class Notification extends ClassTemplate {
	/** @type {Discord} */
	static discord = null;
	/** @type {Telegram} */
	static telegram = null;

	constructor (config) {
		super();

		if (config.constructor !== Object) {
			throw new Error({ message: "config must be an object" });
		}

		if (typeof config.discord !== "object") {
			throw new Error({ message: "config.discord must be an object" });
		}

		if (typeof config.telegram !== "object") {
			throw new Error({ message: "config.telegram must be an object" });
		}

		if (config.discord.enabled) {
			this.discord = new Discord(config.discord);
		}

		if (config.telegram.enabled) {
			this.telegram = new Telegram(config.telegram.config);
		}
	}

	async send (service, data, options = {}) {
		if (service !== "discord" && service !== "telegram") {
			throw new Error({ message: "service must be either discord or telegram" });
		}

		if (service === "discord") {
			if (this.discord === null) {
				throw new Error({ message: "Discord is not enabled" });
			}

			return await this.discord.send(data, options);
		}
		else if (service === "telegram") {
			if (this.telegram === null) {
				throw new Error({ message: "Telegram is not enabled" });
			}

			return await this.telegram.send(data, options);
		}
	}
}
