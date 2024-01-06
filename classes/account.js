module.exports = class Account extends require("./template.js") {
	static data = new Map();

	constructor (data) {
		super();

		this.id = data.id;

		this.uid = data.uid;

		this.rank = data.rank;

		this.username = data.username;

		this.region = data.region;

		this.cookie = data.cookie;

		this.threshold = data.threshold ?? 150;

		this.skipChecks = data.skipChecks ?? false;
	}

	static async initialize (data) {
		Account.data = new Map();
		await Account.loadData(data);
		return Account;
	}

	static async loadData (data) {
		await this.validate(data);
	}

	static get (id) {
		if (typeof id === "string") {
			const account = Account.data.get(id);
			if (!account) {
				return null;
			}

			return account;
		}
		else {
			throw new sr.Error({
				message: "Invalid argument type",
				args: {
					id,
					type: typeof id
				}
			});
		}
	}

	static async validate (accountList) {
		const accounts = accountList;
		if (accounts.length === 0) {
			throw new sr.Error({ message: "No accounts found in config file." });
		}

		for (const account of accounts) {
			const regex = /(ltuid_v2|ltoken_v2|ltoken|ltuid)=\w+/g;
			if (!regex.test(account.cookie)) {
				throw new sr.Error({
					message: "Cookie must contain at least one of the following: ltuid_v2, ltoken_v2, ltoken, ltuid",
					args: {
						account
					}
				});
			}
		}

		for (let i = 0; i < accounts.length; i++) {
			const account = accounts[i];
			const regex = /(account_id|ltuid_v2)=(\d+)/;
			const id = account.cookie?.match?.(regex)?.[2];
			if (!id) {
				sr.Logger.warn(`Account ${i + 1} has no account_id in cookie. Skipping fetching account data...`);
				
				const accountData = new Account({
					id: i + 1,
					uid: accounts[i].uid,
					rank: 0,
					username: "Unknown",
					region: "Unknown",
					cookie: account.cookie,
					threshold: account.threshold,
					skipChecks: Boolean(account.uid === null)
				});

				Account.data.set(i, accountData);
				continue;
			}

			const { statusCode, body } = await sr.Got({
				url: "https://bbs-api-os.hoyolab.com/game_record/card/wapi/getGameRecordCard",
				responseType: "json",
				throwHttpErrors: false,
				searchParams: {
					uid: id
				},
				headers: {
					Cookie: account.cookie
				}
			});

			if (statusCode !== 200) {
				throw new sr.Error({
					message: `Account ${i + 1} is invalid.`,
					args: {
						account: {
							uid: id
						},
						request: {
							statusCode,
							body
						}
					}
				});
			}

			if (body.data === null) {
				throw new sr.Error({
					message: `Account ${i + 1} is invalid.`,
					args: {
						account: {
							uid: id
						},
						request: {
							statusCode,
							body
						}
					}
				});
			}

			if (body.retcode !== 0) {
				throw new sr.Error({
					message: `Account ${i + 1} is invalid.`,
					args: {
						account: {
							uid: id
						},
						request: {
							statusCode,
							body
						}
					}
				});
			}

			const data = body.data.list;
			const starrailAccount = data.find(i => i.game_id === 6);
			if (!starrailAccount) {
				sr.Logger.warn(`Account ${i + 1} [${id}] has no StarRail account. Skipping...`);
				continue;
			}

			const duplicate = [...Account.data.values()].find(i => i.uid === String(starrailAccount.game_role_id));
			if (duplicate) {
				sr.Logger.warn(`Account ${i + 1} [${id}] is a duplicate. Skipping...`);
				continue;
			}

			const uid = String(starrailAccount.game_role_id);
			const accountData = new Account({
				id,
				uid,
				rank: starrailAccount.level,
				username: starrailAccount.nickname,
				region: starrailAccount.region,
				cookie: account.cookie,
				threshold: account.threshold,
				skipChecks: Boolean(account.uid === null)
			});

			Account.data.set(uid, accountData);
		}

		console.table([...Account.data.values()].map(i => ({
			"Account ID": i.id,
			UID: i.uid,
			Rank: i.rank,
			Username: i.username,
			Region: i.region,
			Threshold: i.threshold,
			"Skip Checks": i.skipChecks
		})));

		return true;
	}

	static getActiveAccounts () {
		return [...Account.data.values()];
	}
};
