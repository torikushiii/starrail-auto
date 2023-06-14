import got from "got";
import Controller from "./template.js";
import Error from "../core/object/error.js";

export default class Telegram extends Controller {
	#chatId;
	#token = null;
	#disableNotification = false;
	#active = false;

	constructor (config) {
		super();

		if (config.enabled === false) {
			return;
		}

		this.#chatId = config.chatId;
		if (typeof this.#chatId !== "number") {
			throw new Error({
				message: "Telegram chatId must be a number",
				args: {
					chatId: config,
					type: {
						expected: "number",
						received: typeof this.#chatId
					}
				}
			});
		}

		this.#token = config.token;
		if (typeof this.#token !== "string") {
			throw new Error({
				message: "Telegram token must be a string",
				args: {
					token: config,
					type: {
						expected: "string",
						received: typeof this.#token
					}
				}
			});
		}

		this.#disableNotification = config.disableNotification;
		if (typeof this.#disableNotification !== "boolean") {
			throw new Error({
				message: "Telegram disableNotification must be a boolean",
				args: {
					disableNotification: config,
					type: {
						expected: "boolean",
						received: typeof this.#disableNotification
					}
				}
			});
		}

		this.#active = true;
	}

	async send (message) {
		if (this.#active === false) {
			throw new sr.Error({ message: "Telegram is not active" });
		}

		const res = await got({
			url: `https://api.telegram.org/bot${this.#token}/sendMessage`,
			method: "POST",
			responseType: "json",
			json: {
				chat_id: this.#chatId,
				text: message,
				disable_notification: this.#disableNotification
			}
		});

		if (res.body.ok !== true) {
			throw new Error({
				message: "Error when sending Telegram message",
				args: {
					statusCode: res.statusCode,
					body: res.body
				}
			});
		}

		return true;
	}

	formatMessage (messageData, options = {}) {
		if (options.checkIn) {
			const messages = [];

			for (const data of messageData) {
				const string = `🏆 Check-in result: ${data.result}`;
				const reward = `🎁 Today's reward: ${data.award.name} x${data.award.count}`;
				const signed = `📅 Monthly signed: ${data.signed}`;

				messages.push(`[Account ${data.account}]\n${string}\n${reward}\n${signed}`);
			}

			return messages.join("\n\n");
		}
		else if (options.stamina) {
			const messages = [];

			for (const data of messageData) {
				const string = data.description;
				const staminaString = `💪 ${data.fields[0].name}`;
				const stamina = data.fields[0].value;
				const capped = `⏰ Capped in: ${data.fields[1].value}`;

				messages.push(`${string}\n\n${staminaString}: ${stamina}\n${capped}`);
			}

			return messages.join("\n\n");
		}
	}

	get active () { return this.#active; }
}
