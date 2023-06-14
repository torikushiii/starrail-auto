import Controller from "./template.js";

export default class Discord extends Controller {
	#active = false;
	#token = null;

	constructor (config) {
		super();

		if (config.enabled === false) {
			return;
		}

		const token = config.webhook;
		if (!token) {
			throw new sr.Error({ message: "Discord webhook doesn't exist" });
		}
		
		this.#token = token;
		this.#active = true;
	}

	async send (embed) {
		if (!this.#active) {
			throw new sr.Error({ message: "Discord is not active" });
		}
		
		const res = await sr.Got({
			url: this.#token,
			method: "POST",
			responseType: "json",
			json: {
				embeds: [embed],
				username: "Honkai: Star Rail",
				avatar_url: "https://i.imgur.com/o0hyhmw.png"
			}
		});

		if (res.statusCode !== 204) {
			throw new sr.Error({
				message: "Failed to send message to Discord",
				args: {
					statusCode: res.statusCode,
					statusMessage: res.statusMessage,
					body: res.body
				}
			});
		}
	}

	generateEmbed (messages) {
		let message = "";

		for (const data of messages) {
			message += `
            No. ${data.account} account:
            ===============================
            🎁 Today's reward: ${data.award.name} x${data.award.count}
            📅 Monthly check-in: ${data.signed} days
            🏆 Check-in result: ${data.result}
            ===============================
            `;
		}
        
		return {
			color: 0xBB0BB5,
			title: "Honkai: Star Rail Auto Check-in",
			author: {
				name: "Honkai: Star Rail",
				icon_url: "https://i.imgur.com/o0hyhmw.png"
			},
			description: message,
			timestamp: new Date(),
			footer: {
				text: "Honkai: Star Rail Auto Check-in"
			}
		};
	}

	get active () { return this.#active; }
}
