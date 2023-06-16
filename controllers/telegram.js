import got from "got";
import Controller from "./template.js";
import Error from "../core/object/error.js";

export default class Telegram extends Controller {
	#chatId;
	#token = null;
	#disableNotification = false;
	#active = false;
	
	static lastUpdateId = 0;
	static firstRun = true;
	
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
		
		this.cron = new sr.Cron({
			name: "telegram-listener",
			// If you recieved error message such as "409: Conflict", try to increase this value
			expression: "*/5 * * * * *",
			description: "Listens for Telegram updates",
			code: () => this.initListeners()
		});

		this.cron.start();
	}

	async initListeners () {
		if (this.#active === false) {
			return;
		}

		const res = await got({
			url: `https://api.telegram.org/bot${this.#token}/getUpdates`,
			method: "POST",
			responseType: "json",
			json: {
				offset: Telegram.lastUpdateId + 1
			}
		});

		if (res.body.ok !== true) {
			throw new Error({
				message: "Error when getting Telegram updates",
				args: {
					statusCode: res.statusCode,
					body: res.body
				}
			});
		}

		if (Telegram.firstRun === true && res.body.result.length > 0) {
			// set lastUpdateId to the latest update on first run to avoid unexpected behavior
			Telegram.lastUpdateId = res.body.result[res.body.result.length - 1].update_id;
			Telegram.firstRun = false;
			return;
		}
		else if (res.body.result.length === 0) {
			Telegram.firstRun = false;
		}

		for (const update of res.body.result) {
			Telegram.lastUpdateId = update.update_id;
			const message = update.message.text;

			switch (message) {
				case "/stamina": {
					await this.send("📊 Getting stamina data...");

					const staminaResult = await sr.Stamina.checkAndRun({ checkOnly: true });
					for (const message of staminaResult) {
						const { uid, currentStamina, maxStamina, delta } = message;
						const staminaString = `📊 [${uid}] Stamina: ${currentStamina}/${maxStamina}`;
						const deltaString = `📈 capped in: ${delta}`;

						await this.send(`${staminaString}\n${deltaString}`);
					}

					break;
				}

				case "/expedition": {
					await this.send("📊 Getting expedition data...");

					const expeditionResult = await sr.Expedition.checkAndRun({ checkOnly: true });
					for (const data of expeditionResult) {
						const { uid } = data;
						if (!data?.expeditions) {
							await this.send(`[${uid}] No expedition is running or all expedition has been completed!`);
							continue;
						}

						const expedition = data.expeditions.map(item => {
							const { delta } = item;
							return `📈 Remaining time: ${delta}`;
						}).join("\n");

						await this.send(`[${uid}] Expedition is running!\n${expedition}`);
					}
					
					break;
				}
			}
		}
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

	prepareMessage (messageData, options = {}) {
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
			const { uid, currentStamina, maxStamina, delta } = messageData;

			const alertMessage = "⚠️ Your stamina is above the threshold! ⚠️";
			const staminaString = `📊 [${uid}] Stamina: ${currentStamina}/${maxStamina}`;
			const deltaString = `📈 capped in: ${delta}`;

			return `${alertMessage}\n\n${staminaString}\n${deltaString}`;
		}
	}

	get active () { return this.#active; }
}
