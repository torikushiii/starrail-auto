import HoyoTemplate from "./template.js";

export default class CheckIn extends HoyoTemplate {
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

	static async checkAndSign () {
		const cookies = CheckIn.#getCookies();
        
		for (let i = 0; i < cookies.length; i++) {
			const [infoData, awardsData] = await Promise.all([
				CheckIn.getSignInfo(cookies[i]),
				CheckIn.getAwards(cookies[i])
			]);

			const info = infoData;
			const awards = awardsData;

			if (!info || !awards) {
				sr.Logger.warn(`[Account ${i + 1}]: Failed to get sign info or awards`);
				continue;
			}

			if (awards.length === 0) {
				sr.Logger.warn(`[Account ${i + 1}]: No awards found (?)`);
				continue;
			}

			const data = {
				today: info.data.today,
				total: info.data.total_sign_day,
				issigned: info.data.is_sign,
				missed: info.data.sign_cnt_missed
			};

			if (data.issigned) {
				sr.Logger.warn(`[Account ${i + 1}]: You've already checked in today, Trailblazer~`);
				CheckIn.discordMessages.push({
					account: i + 1,
					signed: data.total,
					result: "You've already checked in today, Trailblazer~",
					award: {
						name: awards[data.total].name,
						count: awards[data.total].cnt
					}
				});
                
				continue;
			}

			const totalSigned = data.total;
			const awardData = {
				name: awards[totalSigned].name,
				count: awards[totalSigned].cnt
			};

			await CheckIn.sign(cookies[i]);

			sr.Logger.info(`[Account ${i + 1}]: Signed-in successfully! You've signed in for ${totalSigned + 1} days!`);
			sr.Logger.info(`[Account ${i + 1}]: You've received ${awardData.count}x ${awardData.name}!`);

			CheckIn.discordMessages.push({
				account: i + 1,
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

		return cookies.map(i => i.cookie);
	}
}
