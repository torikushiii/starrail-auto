module.exports = class Discord extends require("./template.js") {
	#active = false;
	#token = null;

	constructor () {
		super();

		const token = sr.Config.get("DISCORD_WEBHOOK");
		if (!token || token === null) {
			console.warn("Discord Webhook is not set, disabling Discord.");
			return;
		}

		this.#token = token;
		this.#active = true;
	}

	async send (embed) {
		if (!this.#active) {
			throw new sr.Error({ message: "Discord is not active." });
		}

		const res = await sr.Got({
			url: this.#token,
			method: "POST",
			responseType: "json",
			throwHttpErrors: false,
			searchParams: {
				wait: true
			},
			json: {
				embeds: [embed],
				username: "Honkai: Star Rail",
				avatar_url: "https://webstatic-sea.hoyolab.com/communityweb/business/starrail_hoyoverse.png"
			}
		});

		if (res.statusCode !== 200) {
			throw new sr.Error({
				message: "Discord Webhook returned an error.",
				args: {
					statusCode: res.statusCode,
					statusMessage: res.statusMessage,
					body: res.body
				}
			});
		}

		return true;
	}

	async prepareMessage (messageData, options = {}) {
		if (options.checkIn) {
			for (let i = 0; i < messageData.length; i++) {
				const { uid, username, signed, result, award } = messageData[i];
				const accountData = sr.Account.get(uid);

				const embed = {
					color: 0xBB0BB5,
					title: "Honkai: Star Rail Daily Login",
					author: {
						name: "PomPom",
						icon_url: "https://i.imgur.com/o0hyhmw.png"
					},
					thumbnail: {
						url: award.icon
					},
					description: "You have successfully checked in today, Trailblazer~",
					fields: [
						{
							name: "Nickname",
							value: username,
							inline: true
						},
						{
							name: "UID",
							value: uid,
							inline: true
						},
						{
							name: "Rank",
							value: accountData.rank,
							inline: true
						},
						{
							name: "Region",
							value: sr.Utils.formattedAccountRegion(accountData.region),
							inline: true
						},
						{
							name: "Today's Reward",
							value: `${award.name} x${award.count}`,
							inline: true
						},
						{
							name: "Total Sign-in Days",
							value: signed,
							inline: true
						},
						{
							name: "Result",
							value: result,
							inline: true
						}
					],
					timestamp: new Date(),
					footer: {
						text: `HoyoLab Auto Check-in (${i + 1} / ${messageData.length} Executed)`,
						icon_url: "https://webstatic.hoyoverse.com/upload/static-resource/2022/08/04/8a31e3d6bce7684556cd45b1e1c309bf_1216320235452608527.png"
					}
				};

				await this.send(embed);
			}
		}
		else if (options.stamina) {
			const { uid, username, currentStamina, maxStamina, delta } = messageData;
			const embed = {
				color: 0xBB0BB5,
				title: "Honkai: Star Rail - Stamina",
				author: {
					name: "PomPom",
					icon_url: "https://i.imgur.com/o0hyhmw.png"
				},
				description: "⚠️ Your stamina is above the threshold ⚠️",
				fields: [
					{
						name: `[${uid}] ${username} Current Stamina`,
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
			const { uid, username } = messageData;
			const embed = {
				color: 0xBB0BB5,
				title: "Honkai: Star Rail - Expedition",
				author: {
					name: "PomPom",
					icon_url: "https://i.imgur.com/o0hyhmw.png"
				},
				description: `⚠️ All expedition are done! ⚠️`,
				fields: [
					{
						name: `[${uid}] ${username}`,
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
		else if (options.reserve) {
			const { uid, username, currentReserveStamina } = messageData;
			const embed = {
				color: 0xBB0BB5,
				title: "Honkai: Star Rail - Reserve Stamina",
				author: {
					name: "PomPom",
					icon_url: "https://i.imgur.com/o0hyhmw.png"
				},
				description: "⚠️ Your reserve stamina is full ⚠️",
				fields: [
					{
						name: `[${uid}] ${username} Current Reserve Stamina`,
						value: `${currentReserveStamina}`,
						inline: false
					}
				]
			};

			return embed;
		}
	}

	get active () { return this.#active; }
};
