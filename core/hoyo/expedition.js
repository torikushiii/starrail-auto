import crypto from "crypto";
import HoyoTemplate from "./template.js";

export default class Expedition extends HoyoTemplate {
	static DS_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";

	static timeUnits = {
		h: { m: 60, s: 3600, ms: 3600.0e3 },
		m: { s: 60, ms: 60.0e3 },
		s: { ms: 1.0e3 }
	};

	static data = new Map();

	static async checkAndRun (options = {}) {
		const result = [];

		for (const [uid, account] of Expedition.data) {
			const generatedDS = Expedition.generateDS(Expedition.DS_SALT);
			const region = Expedition.getAccountRegion(account.uid);

			const res = await sr.Got({
				url: "https://bbs-api-os.hoyolab.com/game_record/hkrpg/api/note",
				prefixUrl: "",
				searchParams: {
					server: region,
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
				sr.Logger.json({
					message: "Error when getting stamina info",
					args: {
						statusCode: res.statusCode,
						body: res.body
					}
				});

				continue;
			}

			if (res.body.retcode !== 0 && res.body.message !== "OK") {
				sr.Logger.json({
					message: "API error when getting stamina info",
					args: {
						statusCode: res.statusCode,
						body: res.body
					}
				});

				continue;
			}

			const { data } = res.body;
			const { expeditions } = data;

			const isAllCompleted = expeditions.every(i => i.status !== "Ongoing");
			if (isAllCompleted && options.checkOnly) {
				result.push({ uid: account.uid });
				
				continue;
			}
			else if (!isAllCompleted && options.checkOnly) {
				result.push({
					uid: account.uid,
					expeditions: expeditions.map(i => ({
						delta: Expedition.formatTime(i.remaining_time)
					}))
				});

				continue;
			}

			if (isAllCompleted && options.skipCheck) {
				result.push({ uid: account.uid });
				
				continue;
			}

			if (isAllCompleted && !options.skipCheck) {
				result.push({ uid: account.uid });
			}
		}

		return result;
	}

	static async initialize () {
		Expedition.data = new Map();
		await Expedition.loadData();
		return Expedition;
	}

	static async loadData () {
		const accounts = sr.Account.getActiveAccounts();
		for (const account of accounts) {
			if (!this.getAccountRegion(account.uid)) {
				continue;
			}

			Expedition.data.set(account.uid, {
				...account,
				fired: false
			});

			sr.Logger.info(`Loaded account with uid "${account.uid}" for expedition check`);
		}
	}

	static generateDS (salt) {
		const time = (Date.now() / 1000).toFixed(0);
		const random = Expedition.randomString();
		const hash = Expedition.hash(`salt=${salt}&t=${time}&r=${random}`);

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

		if (seconds >= Expedition.timeUnits.h.s) {
			const hours = Math.floor(seconds / Expedition.timeUnits.h.s);
			seconds -= hours * Expedition.timeUnits.h.s;
			array.push(`${hours} hr`);
		}
        
		if (seconds >= Expedition.timeUnits.m.s) {
			const minutes = Math.floor(seconds / Expedition.timeUnits.m.s);
			seconds -= minutes * Expedition.timeUnits.m.s;
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

	static getAccountRegion (uid) {
		const region = uid.toString().slice(0, 1);
		switch (region) {
			case "8":
				return `prod_official_asia`;
			case "7":
				return `prod_official_eur`;
			case "6":
				return `prod_official_usa`;
			default:
				return false;
		}
	}
}
