module.exports = class Telegram extends require("./template.js") {
	#chatId;
	#token = null;
	#disableNotification = false;
	#active = false;
	
	static lastUpdateId = 0;
	static firstRun = true;
	
	constructor () {
		super();

		this.#chatId = sr.Config.get("TELEGRAM_CHAT_ID");
		this.#token = sr.Config.get("TELEGRAM_TOKEN");
		this.#disableNotification = sr.Config.get("TELEGRAM_DISABLE_NOTIFICATION") ?? false;

		if (!this.#chatId || !this.#token) {
			console.warn("Telegram chat ID or token is not set, disabling Telegram.");
			return;
		}

		this.#active = true;

		// If you recieved error message such as "409: Conflict", try to increase this value
		setInterval(() => this.initListeners(), 5000);
	}

	async initListeners () {
		if (this.#active === false) {
			return;
		}

		const res = await sr.Got({
			url: `https://api.telegram.org/bot${this.#token}/getUpdates`,
			method: "POST",
			responseType: "json",
			throwHttpErrors: false,
			timeout: {
				request: 5000
			},
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
			const message = update?.message?.text;
			if (!message) {
				continue;
			}

			switch (message) {
				case "/stamina": {
					await this.send("📊 Getting stamina data...");
					await this.handleCommand("stamina", []);
					break;
				}

				case "/expedition": {
					await this.send("📊 Getting expedition data...");
					await this.handleCommand("expedition", []);
					break;
				}
			}
		}
	}

	async send (message) {
		if (this.#active === false) {
			throw new sr.Error({ message: "Telegram is not active" });
		}

		const res = await sr.Got({
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
			throw new sr.Error({
				message: "Error when sending Telegram message",
				args: {
					statusCode: res.statusCode,
					body: res.body
				}
			});
		}

		return true;
	}

	async handleCommand (command, args) {
		const execution = await sr.Command.checkAndRun(command, args, {
			platform: {
				id: 1,
				name: "Telegram"
			}
		});

		if (!execution) {
			return;
		}

		const { reply } = execution;
		if (!reply) {
			return;
		}

		const message = execution.reply;
		await this.send(message);
	}

	prepareMessage (messageData, options = {}) {
		if (options.checkIn) {
			const messages = [];

			for (const data of messageData) {
				const string = `🏆 Check-in result: ${data.result}`;
				const reward = `🎁 Today's reward: ${data.award.name} x${data.award.count}`;
				const signed = `📅 Monthly signed: ${data.signed}`;

				messages.push(`[Account ${data.uid} ${data.username}]\n${string}\n${reward}\n${signed}`);
			}

			return messages.join("\n\n");
		}
		else if (options.stamina) {
			const { uid, username, currentStamina, maxStamina, delta } = messageData;

			const alertMessage = "⚠️ Your stamina is above the threshold! ⚠️";
			const staminaString = `📊 [${uid}] ${username} Stamina: ${currentStamina}/${maxStamina}`;
			const deltaString = `📈 capped in: ${delta}`;

			return `${alertMessage}\n\n${staminaString}\n${deltaString}`;
		}
	}

	get active () { return this.#active; }
};
