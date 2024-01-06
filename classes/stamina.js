module.exports = class Stamina extends require("./template.js") {
	static MAX_STAMINA = 240;

	static data = new Map();

	static async checkAndRun (options = {}) {
		const result = [];

		for (const [uid, account] of Stamina.data) {
			const generatedDS = sr.Utils.generateDS();
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
				stamina_recover_time: staminaRecoverTime,
				current_reserve_stamina: currentReserveStamina,
				is_reserve_stamina_full: isReserveStaminaFull
			} = data;

			const delta = sr.Utils.formatTime(staminaRecoverTime);
			const objectData = {
				uid,
				username: account.username,
				currentStamina,
				maxStamina,
				currentReserveStamina,
				isReserveStaminaFull,
				delta
			};

			if (options.checkOnly) {
				result.push(objectData);
				continue;
			}

			if (currentStamina <= account.threshold && !isReserveStaminaFull) {
				Stamina.data.set(uid, {
					...account,
					fired: false
				});

				continue;
			}

			if (currentStamina <= account.threshold && isReserveStaminaFull) {
				result.push({
					uid,
					username: account.username,
					currentReserveStamina,
					isReserveStaminaFull
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
			if (!account.uid) {
				continue;
			}
			else if (!sr.Utils.getAccountRegion(account.uid)) {
				continue;
			}

			if (account.skipChecks) {
				continue;
			}

			if (account.threshold > Stamina.MAX_STAMINA) {
				throw new sr.Error({ message: `Threshold cannot be greater than max stamina (${Stamina.MAX_STAMINA})` });
			}

			Stamina.data.set(account.uid, {
				...account,
				fired: false
			});
		}
	}
};
