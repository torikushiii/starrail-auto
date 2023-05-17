import got from "./lib/got.js";
import { CronJob } from "cron";
import { config } from "dotenv";
import logger from "./lib/winston.js";
import DiscordModule from "./lib/discord.js";

config();

const COOKIE = process.env.COOKIE;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

const ACT_ID = "e202303301540311";

class StarRail {
	#cookie;
	discordMessage = [];

	constructor (cookie) {
		if (typeof cookie !== "string" || typeof cookie === "undefined") {
			throw new Error("cookie must be a string");
		}

		this.#cookie = cookie;
	}

	static async sign (cookie) {
		const res = await got({
			method: "POST",
			url: "sign",
			headers: {
				Cookie: cookie
			},
			json: {
				act_id: ACT_ID
			}
		});

		if (res.statusCode !== 200) {
			throw new Error(`[sign] HTTP Error: ${res.statusCode} ${res.statusMessage}`);
		}

		if (res.body.retcode !== 0 && res.body.message !== "OK") {
			throw new Error(`[sign] API Error: ${res.body.message}`);
		}

		return res.body;
	}

	async run () {
		const cookies = this.#parseCookies;

		let counter = 0;
		for (const cookie of cookies) {
			counter++;

			const [infoData, awardsData] = await Promise.allSettled([
				StarRail.getInfo(cookie),
				StarRail.awards(cookie)
			]);

			if (infoData.status === "rejected") {
				throw new Error(`API error: ${infoData.reason.message}`);
			}

			if (awardsData.status === "rejected") {
				throw new Error(`API error: ${awardsData.reason.message}`);
			}

			const info = infoData.value;
			const awards = awardsData.value;

			if (awards.length === 0) {
				logger.warn(`[Account ${counter}]: No awards found (?)`);
				continue;
			}

			const data = {
				today: info.data.today,
				total: info.data.total_sign_day,
				issigned: info.data.is_sign,
				missed: info.data.sign_cnt_missed
			};

			if (data.issigned) {
				logger.warn(`[Account ${counter}]: You've already checked in today, Trailblazer~`);
				this.discordMessage.push({
					account: counter,
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

			const sign = await StarRail.sign(cookie);
			if (sign.retcode !== 0 && sign.message !== "OK") {
				throw new Error(`[Account ${counter}]: API error: ${sign.message}`);
			}

			logger.info(`[Account ${counter}]: Signed in successfully! You have signed in for ${data.total} days!`);
			logger.info(`[Account ${counter}]: You have received ${awardData.count}x ${awardData.name}!`);

			if (!DISCORD_WEBHOOK || typeof DISCORD_WEBHOOK !== "string") {
				logger.info("No Discord webhook found, skipping Discord message");
				continue;
			}

			this.discordMessage.push({
				account: counter,
				signed: data.total,
				result: "OK",
				award: awardData
			});
		}

		if (this.discordMessage.length === 0) {
			return;
		}

		const Discord = new DiscordModule();
		await Discord.send(this.discordMessage);

		return;
	}

	static async getInfo (cookie) {
		const res = await got({
			url: "info",
			headers: {
				Cookie: cookie
			},
			searchParams: {
				act_id: ACT_ID
			}
		});

		if (res.statusCode !== 200) {
			throw new Error(`[getInfo] HTTP error: ${res.statusCode}`);
		}

		if (res.body.retcode !== 0 && res.body.message !== "OK") {
			throw new Error(`[getInfo] API error: ${res.body.message}`);
		}

		return res.body;
	}

	static async awards (cookie) {
		const res = await got({
			url: "home",
			headers: {
				Cookie: cookie
			},
			searchParams: {
				act_id: ACT_ID
			}
		});

		if (res.statusCode !== 200) {
			throw new Error(`[awards] HTTP error: ${res.statusCode}`);
		}

		if (res.body.retcode !== 0 && res.body.message !== "OK") {
			throw new Error(`[awards] API error: ${res.body.message}`);
		}

		return res.body.data.awards;
	}

	get #parseCookies () {
		return this.#cookie.split("#");
	}
}

export default StarRail;

if (process.argv.includes("--sign")) {
	const starRail = new StarRail(COOKIE);
	await starRail.run();

	process.exit(0);
}
else {
	/**
     * Adjust the time to your liking.
     * Or when does the daily reset happen in your timezone.
     */
	const job = new CronJob("0 0 0 * * *", async () => {
		const starRail = new StarRail(COOKIE);
		await starRail.run();
	});

	job.start();

	logger.info("Cron job started");
}
