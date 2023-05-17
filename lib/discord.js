import got from "got";

export default class Discord {
	async send (data) {
		if (!Discord.webhookAuth) {
			return;
		}
        
		const embed = Discord.generateEmbed(data);
		const res = await got({
			url: Discord.webhookAuth,
			method: "POST",
			responseType: "json",
			json: {
				embeds: [embed],
				username: "Honkai: Star Rail",
				avatar_url: "https://i.imgur.com/o0hyhmw.png"
			}
		});

		if (res.statusCode !== 204) {
			throw new Error(`Discord webhook error: ${res.statusCode}`);
		}

		return true;
	}

	static generateEmbed (messages) {
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
			title: "Honkai: Star Rail Auto Check-in",
			author: {
				name: "Honkai: Star Rail",
				icon_url: "https://i.imgur.com/o0hyhmw.png"
			},
			description: message,
			color: 0xBB0BB5,
			timestamp: new Date(),
			footer: {
				text: "Honkai: Star Rail Auto Check-in"
			}
		};
	}

	static get webhookAuth () {
		const auth = process.env.DISCORD_WEBHOOK;

		if (!auth || typeof auth !== "string") {
			return null;
		}

		return auth;
	}
}
