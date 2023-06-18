import crypto from "crypto";
import HoyoTemplate from "./template.js";

export default class Expedition extends HoyoTemplate {
	static DS_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";
	static data = new Map();

	static async checkAndRun (options = {}) {
		const result = [];

		for (const [uid, account] of Expedition.data) {
			const generatedDS = Expedition.generateDS(Expedition.DS_SALT);
			const region = sr.Utils.getAccountRegion(account.uid);

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

			const isAllCompleted = expeditions.every(i => i.status === "Ongoing");
			if (!isAllCompleted) {
				Expedition.data.set(uid, {
					...account,
					fired: false
				});
			}

			if (isAllCompleted && options.checkOnly) {
				result.push({ uid: account.uid });
				
				continue;
			}
			else if (!isAllCompleted && options.checkOnly) {
				result.push({
					uid: account.uid,
					expeditions: expeditions.map(i => ({
						delta: sr.Utils.formatTime(i.remaining_time)
					}))
				});

				continue;
			}

			if (isAllCompleted && options.skipCheck) {
				result.push({ uid: account.uid });
				
				continue;
			}

			if (isAllCompleted && !account.fired) {
				result.push({ uid: account.uid });
				Expedition.data.set(uid, {
					...account,
					fired: true
				});
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
			if (!sr.Utils.getAccountRegion(account.uid)) {
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
}
