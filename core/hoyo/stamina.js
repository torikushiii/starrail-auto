import crypto from "crypto";
import HoyoTemplate from "./template.js";

export default class Stamina extends HoyoTemplate {
	static MAX_STAMINA = 180;
	static DS_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";

	static data = new Map();

	static async checkAndRun (options = {}) {
		const result = [];

		for (const [uid, account] of Stamina.data) {
			const generatedDS = Stamina.generateDS(Stamina.DS_SALT);
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
			const {
				current_stamina: currentStamina,
				max_stamina: maxStamina,
				stamina_recover_time: staminaRecoverTime
			} = data;

			const delta = sr.Utils.formatTime(staminaRecoverTime);
			const objectData = {
				uid,
				currentStamina,
				maxStamina,
				delta
			};

			if (options.checkOnly) {
				result.push(objectData);
				continue;
			}

			if (currentStamina <= account.threshold) {
				Stamina.data.set(uid, {
					...account,
					fired: false
				});

				continue;
			}

			if (options.skipCheck) {
				result.push(objectData);
				continue;
			}

			if (account.fired) {
				continue;
			}

			result.push(objectData);
			Stamina.data.set(uid, {
				...account,
				fired: true
			});
		}

		return result;
	}

	static async initialize () {
		Stamina.data = new Map();
		await Stamina.loadData();
		return Stamina;
	}

	static async loadData () {
		const accounts = sr.Account.getActiveAccounts();
		for (const account of accounts) {
			if (!sr.Utils.getAccountRegion(account.uid)) {
				continue;
			}

			if (account.skipChecks) {
				continue;
			}

			Stamina.data.set(account.uid, {
				...account,
				fired: false
			});
		}
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
}
