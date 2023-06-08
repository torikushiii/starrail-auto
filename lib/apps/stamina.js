import got from "../got.js";
import crypto from "crypto";
import Error from "./error.js";
import logger from "../winston.js";

export default class Stamina {
	static fired = false;
	static MAX_STAMINA = 180;
	static DS_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";

	static timeUnits = {
		h: { m: 60, s: 3600, ms: 3600.0e3 },
		m: { s: 60, ms: 60.0e3 },
		s: { ms: 1.0e3 }
	};

	static accounts = new Map();

	constructor (data) {
		if (!Array.isArray(data.accounts)) {
			throw new Error({ message: "Accounts must be an array" });
		}

		if (data.accounts.length === 0) {
			throw new Error({ message: "Accounts must have at least one element" });
		}

		const accounts = data.accounts.filter(i => i.uid !== null);

		for (const account of accounts) {
			if (Number.isNaN(Number(account.uid))) {
				throw new Error({ message: "UID must be a number" });
			}

			if (account.cookie === null) {
				throw new Error({ message: "Cookie must be provided" });
			}

			if (typeof account.cookie !== "string") {
				throw new Error({ message: "Cookie must be a string" });
			}

			if (!account.threshold) {
				throw new Error({ message: "Threshold must be provided" });
			}

			if (Number.isNaN(Number(account.threshold))) {
				throw new Error({ message: "Threshold must be a number" });
			}

			if (account.threshold < 0) {
				throw new Error({ message: "Threshold must be a positive number" });
			}

			if (account.threshold > Stamina.MAX_STAMINA) {
				throw new Error({ message: "Threshold must be less than 180" });
			}

			if (Stamina.accounts.has(account.uid)) {
				throw new Error({ message: `Account with UID ${account.uid} already exists` });
			}

			Stamina.accounts.set(account.uid, {
				...account,
				fired: false
			});
		}
	}

	async run () {
		const result = [];

		for (const [uid, account] of Stamina.accounts) {
			const generatedDS = Stamina.generateDS(Stamina.DS_SALT);

			const res = await got({
				url: "https://bbs-api-os.hoyolab.com/game_record/hkrpg/api/note",
				prefixUrl: "",
				searchParams: {
					server: "prod_official_asia",
					role_id: uid
				},
				headers: {
					"x-rpc-app_version": "1.5.0",
					"x-rpc-client_type": 5,
					"x-rpc-language": "en-us",
					Cookie: account.cookie,
					DS: generatedDS
				}
			});

			if (res.statusCode !== 200) {
				throw new Error({
					message: "Error when getting stamina info",
					args: {
						statusCode: res.statusCode,
						body: res.body
					}
				});
			}

			if (res.body.retcode !== 0 && res.body.message !== "OK") {
				throw new Error({
					message: "API error when getting stamina info",
					args: {
						statusCode: res.statusCode,
						body: res.body
					}
				});
			}

			const { data } = res.body;
			const {
				current_stamina: currentStamina,
				max_stamina: maxStamina,
				stamina_recover_time: staminaRecoverTime
			} = data;

			if (currentStamina <= account.threshold) {
				account.fired = false;
				return [];
			}

			const delta = `Capped in ${Stamina.formatTime(staminaRecoverTime)}`;
			logger.info(`Stamina for UID ${uid} is above the threshold (${currentStamina}/${maxStamina}) - ${delta}`);

			if (account.fired) {
				return [];
			}

			account.fired = true;

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
						name: "Current Stamina",
						value: `${currentStamina}/${maxStamina}`,
						inline: false
					}
				],
				timestamp: new Date(),
				footer: {
					text: "Honkai: Star Rail - Stamina"
				}
			};

			if (staminaRecoverTime > 0) {
				embed.fields.push({
					name: "Capped in",
					value: Stamina.formatTime(staminaRecoverTime),
					inline: true
				});
			}

			result.push(embed);
		}

		return result;
	}

	static generateDS (salt) {
		const time = (Date.now() / 1000).toFixed(0);
		const random = Stamina.randomString();
		const hash = Stamina.hash(`salt=${salt}&t=${time}&r=${random}`);

		return `${time},${random},${hash}`;
	}

	static randomString () {
		let result = "";
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const length = 6;

		for (let i = 0; i < length; i++) {
			result += chars[Math.floor(Math.random() * chars.length)];
		}

		return result;
	}

	static hash (string) {
		return crypto
			.createHash("md5")
			.update(string)
			.digest("hex");
	}

	static formatTime (seconds = 0) {
		const array = [];

		if (seconds >= Stamina.timeUnits.h.s) {
			const hours = Math.floor(seconds / Stamina.timeUnits.h.s);
			seconds -= hours * Stamina.timeUnits.h.s;
			array.push(`${hours} hr`);
		}
        
		if (seconds >= Stamina.timeUnits.m.s) {
			const minutes = Math.floor(seconds / Stamina.timeUnits.m.s);
			seconds -= minutes * Stamina.timeUnits.m.s;
			array.push(`${minutes} min`);
		}

		if (seconds >= 0 || array.length === 0) {
			array.push(`${this.round(seconds, 3)} sec`);
		}

		return array.join(", ");
	}

	static round (number, precision = 0) {
		return Math.round(number * (10 ** precision)) / (10 ** precision);
	}
}
