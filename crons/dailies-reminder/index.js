module.exports = {
	name: "dailies-reminder",
	expression: sr.Config.get("DAILIES_REMINDER") ?? "0 21 * * *",
	description: "Remind you to do your dailies",
	code: (async function announceDailiesReminder () {
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
					message: "Error when getting daily info",
					args: {
						statusCode: res.statusCode,
						body: res.body
					}
				});

				continue;
			}

			if (res.body.retcode !== 0 && res.body.message !== "OK") {
				sr.Logger.json({
					message: "API error when getting daily info",
					args: {
						statusCode: res.statusCode,
						body: res.body
					}
				});

				continue;
			}

			const { data } = res.body;
			const { current_train_score, max_train_score } = data;

			const isAllCompleted = current_train_score === max_train_score;
			if (!isAllCompleted) {
				const message = [
					`👋 Hey [${account.uid}] ${account.username}!`,
					"📝 You still have some dailies to do!",
					`📈 You're currently at: ${current_train_score}/${max_train_score}`,
					"⏰ Remember to do them before the day resets!"
				].join("\n");

				if (sr.Discord && sr.Discord.active) {
					const embed = {
						color: 0xBB0BB5,
						title: "Dailies reminder",
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
					await sr.Telegram.send(message);
				}
			}
		}
	})
};
