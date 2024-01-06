module.exports = class CheckIn extends require("./template.js") {
	static discordMessages = [];

	static data = [];
	static ACT_ID = "e202303301540311";

	static async getSignInfo (cookie) {
		const { statusCode, body } = await sr.Got({
			url: "https://sg-public-api.hoyolab.com/event/luna/os/info",
			headers: {
				Cookie: cookie
			},
			searchParams: {
				act_id: CheckIn.ACT_ID
			}
		});

		if (statusCode !== 200) {
			sr.Logger.json({
				message: "Error when getting sign info",
				args: {
					statusCode,
					body
				}
			});

			return false;
		}

		if (body.retcode !== 0 && body.message !== "OK") {
			sr.Logger.json({
				message: "API error when getting sign info",
				args: {
					statusCode,
					body
				}
			});

			return false;
		}

		return body;
	}

	static async getAwards (cookie) {
		const { statusCode, body } = await sr.Got({
			url: "https://sg-public-api.hoyolab.com/event/luna/os/home",
			headers: {
				Cookie: cookie
			},
			searchParams: {
				act_id: CheckIn.ACT_ID
			}
		});

		if (statusCode !== 200) {
			sr.Logger.json({
				message: "Error when getting awards",
				args: {
					statusCode,
					body
				}
			});

			return false;
		}

		if (body.retcode !== 0 && body.message !== "OK") {
			sr.Logger.json({
				message: "API error when getting awards",
				args: {
					statusCode,
					body
				}
			});

			return false;
		}

		return body.data.awards;
	}

	static async sign (cookie) {
		const { statusCode, body } = await sr.Got({
			method: "POST",
			url: "https://sg-public-api.hoyolab.com/event/luna/os/sign",
			headers: {
				Cookie: cookie
			},
			json: {
				act_id: CheckIn.ACT_ID
			}
		});

		if (statusCode !== 200) {
			sr.Logger.json({
				message: "Error when signing",
				args: {
					statusCode,
					body
				}
			});

			return false;
		}

		if (body.retcode !== 0 && body.message !== "OK") {
			sr.Logger.json({
				message: "API error when signing",
				args: {
					statusCode,
					body
				}
			});

			return false;
		}

		return true;
	}

	static async getSignData () {
		const accountData = CheckIn.#getCookies();

		const list = [];
		for (let i = 0; i < accountData.length; i++) {
			const info = await CheckIn.getSignInfo(accountData[i].cookie);

			if (!info) {
				sr.Logger.warn(`[${accountData[i].uid}]: Failed to get sign info`);
				continue;
			}

			const data = {
				today: info.data.today,
				total: info.data.total_sign_day,
				issigned: info.data.is_sign
			};

			list.push({
				uid: accountData[i].uid,
				username: accountData[i].username,
				cookie: accountData[i].cookie,
				data
			});
		}

		return list;
	}

	static async checkAndSign () {
		const accountData = CheckIn.#getCookies();
        
		for (let i = 0; i < accountData.length; i++) {
			const [infoData, awardsData] = await Promise.all([
				CheckIn.getSignInfo(accountData[i].cookie),
				CheckIn.getAwards(accountData[i].cookie)
			]);

			const info = infoData;
			const awards = awardsData;

			if (!info || !awards) {
				sr.Logger.warn(`[${accountData[i].uid}]: Failed to get sign info or awards`);
				continue;
			}

			if (awards.length === 0) {
				sr.Logger.warn(`[${accountData[i].uid}]: No awards found (?)`);
				continue;
			}

			const data = {
				today: info.data.today,
				total: info.data.total_sign_day,
				issigned: info.data.is_sign,
				missed: info.data.sign_cnt_missed
			};

			if (data.issigned) {
				CheckIn.discordMessages.push({
					uid: accountData[i].uid,
					username: accountData[i].username,
					signed: data.total,
					result: "You've already checked in today, Trailblazer~",
					award: {
						name: awards[data.total].name,
						count: awards[data.total].cnt,
						icon: awards[data.total].icon
					}
				});
                
				continue;
			}

			const totalSigned = data.total;
			const awardData = {
				name: awards[totalSigned].name,
				count: awards[totalSigned].cnt,
				icon: awards[totalSigned].icon
			};

			await CheckIn.sign(accountData[i].cookie);

			CheckIn.discordMessages.push({
				uid: accountData[i].uid,
				username: accountData[i].username,
				signed: totalSigned + 1,
				result: "OK",
				award: awardData
			});
		}

		const message = CheckIn.discordMessages;
		CheckIn.discordMessages = [];

		return message;
	}

	static async initialize () {
		CheckIn.discordMessages = [];
		await CheckIn.loadData();
		return CheckIn;
	}

	static async loadData () {
		const accounts = sr.Account.getActiveAccounts();
		CheckIn.data = accounts;
	}

	static #getCookies () {
		const cookies = CheckIn.data;
		if (cookies.length === 0) {
			throw new sr.Error({ message: "No cookies provided" });
		}

		return cookies.map(i => ({
			cookie: i.cookie,
			uid: i.uid ?? "[???]",
			username: i.username ?? "???"
		}));
	}
};
