import Controller from "./template.js";

export default class Discord extends Controller {
	#active = false;
	#token = null;

	constructor () {
		super();

		const token = sr.Config.get("DISCORD_WEBHOOK");
		if (!token || token === null) {
			return;
		}

		this.#active = true;
		this.#token = token;
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

	prepareMessage (messageData, options = {}) {
		let message = "";

		if (options.checkIn) {
			for (const data of messageData) {
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
		else if (options.stamina) {
			const { uid, currentStamina, maxStamina, delta } = messageData;
			const embed = {
				color: 0xBB0BB5,
				title: "Honkai: Star Rail - Stamina",
				author: {
					name: "Honkai: Star Rail",
					icon_url: "https://i.imgur.com/o0hyhmw.png"
				},
				description: "⚠️ Your stamina is above the threshold ⚠️",
				fields: [
					{
						name: `[${uid}] Current Stamina`,
						value: `${currentStamina}/${maxStamina}`,
						inline: false
					},
					{
						name: "Capped in",
						value: delta,
						inline: false
					}
				],
				timestamp: new Date(),
				footer: {
					text: "Honkai: Star Rail - Stamina"
				}
			};

			return embed;
		}
		else if (options.expedition) {
			const { uid } = messageData;
			const embed = {
				color: 0xBB0BB5,
				title: "Honkai: Star Rail - Expedition",
				author: {
					name: "Honkai: Star Rail",
					icon_url: "https://i.imgur.com/o0hyhmw.png"
				},
				description: `⚠️ All expedition are done! ⚠️`,
				fields: [
					{
						name: `Account: ${uid}`,
						value: "All expedition are done!",
						inline: false
					}
				],
				timestamp: new Date(),
				footer: {
					text: "Honkai: Star Rail - Expedition"
				}
			};

			return embed;
		}
	}

	get active () { return this.#active; }
}
