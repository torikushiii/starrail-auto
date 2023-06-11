import got from "got";
import Error from "./error.js";

export default class Telegram {
	constructor (config) {
		this.chatId = config.chatId;
		this.token = config.token;
		this.disableNotification = config.disableNotification;
	}

	async send (message, options = {}) {
		if (!Array.isArray(message)) {
			throw new Error({ message: "Message must be an array" });
		}

		const formattedMessage = Telegram.formatMessage(message, options);
		const res = await got({
			url: `https://api.telegram.org/bot${this.token}/sendMessage`,
			method: "POST",
			responseType: "json",
			json: {
				chat_id: this.chatId,
				text: formattedMessage,
				disable_notification: this.disableNotification
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

	static formatMessage (messageData, options = {}) {
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
}
