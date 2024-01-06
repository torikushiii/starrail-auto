module.exports = {
	name: "weeklies-reminder",
	expression: sr.Config.get("WEEKLIES_REMINDER") ?? "0 21 * * 0",
	description: "Remind you to do your weeklies",
	code: (async function announceWeekliesReminder () {
		let accounts = sr.Account.getActiveAccounts();
		if (accounts.length === 0) {
			return;
		}

		accounts = accounts.filter(i => i.uid && i.skipChecks === false);
		if (accounts.length === 0) {
			return;
		}

		for (const account of accounts) {
			const ds = sr.Utils.generateDS();
			const region = sr.Utils.getAccountRegion(account.uid);

			const res = await sr.Got({
				url: "https://bbs-api-os.hoyolab.com/game_record/hkrpg/api/note",
				searchParams: {
					server: region,
					role_id: account.uid
				},
				headers: {
					"x-rpc-app_version": "1.5.0",
					"x-rpc-client_type": 5,
					"x-rpc-language": "en-us",
					Cookie: account.cookie,
					DS: ds
				}
			});

			if (res.statusCode !== 200) {
				sr.Logger.json({
					message: "Error when getting weeklies info",
					args: {
						statusCode: res.statusCode,
						body: res.body
					}
				});

				continue;
			}

			if (res.body.retcode !== 0 && res.body.message !== "OK") {
				sr.Logger.json({
					message: "API error when getting weeklies info",
					args: {
						statusCode: res.statusCode,
						body: res.body
					}
				});

				continue;
			}

			const { data } = res.body;
			const {
				current_rogue_score,
				max_rogue_score,
				weekly_cocoon_cnt,
				weekly_cocoon_limit
			} = data;

			const isAllCompleted = (weekly_cocoon_cnt === 0) && (current_rogue_score === max_rogue_score);
			if (isAllCompleted) {
				return;
			}

			const messages = [
				`👋 Hey [${account.uid}] ${account.username}!`,
				"📝 You still have weeklies to do!"
			];

			if (current_rogue_score < max_rogue_score) {
				const currentScore = current_rogue_score.toLocaleString();
				const maxScore = max_rogue_score.toLocaleString();

				messages.push(`🌐 You still have ${currentScore}/${maxScore} Simulated Universe points to do!`);
			}

			if (weekly_cocoon_cnt !== 0) {
				const currentCocoon = weekly_cocoon_cnt.toLocaleString();
				const maxCocoon = weekly_cocoon_limit.toLocaleString();

				messages.push(`👹 You still have ${currentCocoon}/${maxCocoon} World Bosses runs to do!`);
			}

			messages.push("⏰ Don't forget to do your weeklies!");

			if (sr.Discord && sr.Discord.active) {
				const message = messages.join("\n");
				const embed = {
					color: 0xBB0BB5,
					title: "Weeklies Reminder",
					author: {
						name: "Honkai: Star Rail",
						icon_url: "https://i.imgur.com/o0hyhmw.png"
					},
					description: message,
					timestamp: new Date(),
					footer: {
						text: "Honkai: Star Rail"
					}
				};

				await sr.Discord.send(embed);
			}

			if (sr.Telegram && sr.Telegram.active) {
				const message = messages.join("\n");
				await sr.Telegram.send(message);
			}
		}
	})
};
