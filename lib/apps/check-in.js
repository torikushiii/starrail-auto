import got from "../got.js";
import Error from "./error.js";
import logger from "../winston.js";
import template from "./template.js";

export default class CheckIn extends template {
	static discordMessages = [];

	static cookies = [];
	static ACT_ID = "e202303301540311";

	constructor (data) {
		super();

		if (typeof data !== "object") {
			throw new Error({ message: "Data must be an object" });
		}

		if (!data?.cookies) {
			throw new Error({ message: "Cookie must be provided" });
		}
        
		if (!Array.isArray(data.cookies)) {
			throw new Error({ message: "Cookie must be an array" });
		}

		if (data.cookies.length === 0) {
			throw new Error({ message: "Cookie must have at least one element" });
		}

		CheckIn.cookies = data.cookies;
	}

	static async getSignInfo (cookie) {
		const { statusCode, body } = await got({
			url: "info",
			headers: {
				Cookie: cookie
			},
			searchParams: {
				act_id: CheckIn.ACT_ID
			}
		});

		if (statusCode !== 200) {
			throw new Error({
				message: "Error when getting sign info",
				args: {
					statusCode,
					body
				}
			});
		}

		if (body.retcode !== 0 && body.message !== "OK") {
			throw new Error({
				message: "API error when getting sign info",
				args: {
					statusCode,
					body
				}
			});
		}

		return body;
	}

	static async getAwards (cookie) {
		const { statusCode, body } = await got({
			url: "home",
			headers: {
				Cookie: cookie
			},
			searchParams: {
				act_id: CheckIn.ACT_ID
			}
		});

		if (statusCode !== 200) {
			throw new Error({
				message: "Error when getting awards",
				args: {
					statusCode,
					body
				}
			});
		}

		if (body.retcode !== 0 && body.message !== "OK") {
			throw new Error({
				message: "API error when getting awards",
				args: {
					statusCode,
					body
				}
			});
		}

		return body.data.awards;
	}

	static async sign (cookie) {
		const { statusCode, body } = await got({
			method: "POST",
			url: "sign",
			headers: {
				Cookie: cookie
			},
			json: {
				act_id: CheckIn.ACT_ID
			}
		});

		if (statusCode !== 200) {
			throw new Error({
				message: "Error when signing",
				args: {
					statusCode,
					body
				}
			});
		}

		if (body.retcode !== 0 && body.message !== "OK") {
			throw new Error({
				message: "API error when signing",
				args: {
					statusCode,
					body
				}
			});
		}

		return true;
	}

	async checkAndSign () {
		const cookies = CheckIn.#getCookies();
        
		for (let i = 0; i < cookies.length; i++) {
			const [infoData, awardsData] = await Promise.all([
				CheckIn.getSignInfo(cookies[i]),
				CheckIn.getAwards(cookies[i])
			]);

			const info = infoData;
			const awards = awardsData;

			if (awards.length === 0) {
				logger.warn(`[Account ${i + 1}]: No awards found (?)`);
				continue;
			}

			const data = {
				today: info.data.today,
				total: info.data.total_sign_day,
				issigned: info.data.is_sign,
				missed: info.data.sign_cnt_missed
			};

			if (data.issigned) {
				logger.warn(`[Account ${i + 1}]: You've already checked in today, Trailblazer~`);
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

			logger.info(`[Account ${i + 1}]: Signed-in successfully! You've signed in for ${totalSigned + 1} days!`);
			logger.info(`[Account ${i + 1}]: You've received ${awardData.count}x ${awardData.name}!`);

			CheckIn.discordMessages.push({
				account: i + 1,
				signed: totalSigned + 1,
				result: "OK",
				award: awardData
			});
		}

		return { message: CheckIn.discordMessages };
	}

	static #getCookies () {
		const cookies = CheckIn.cookies;
		if (cookies.length === 0) {
			throw new Error({ message: "No cookies provided" });
		}

		return cookies.map(i => i.cookie);
	}
}
