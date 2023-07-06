import ClassTemplate from "./template.js";

export default class Account extends ClassTemplate {
	static data = new Map();
	static ACT_ID = "e202303301540311";

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

	static async initialize () {
		Account.data = new Map();
		await Account.loadData();
		return Account;
	}

	static async loadData () {
		const data = sr.Config.get("COOKIES");
		await this.validate(data);
	}

	static async validate (accountList) {
		const accounts = accountList;
		if (accounts.length === 0) {
			throw new sr.Error({ message: "No accounts found in config file." });
		}

		for (let i = 0; i < accounts.length; i++) {
			const account = accounts[i];
			const id = account.cookie.match(/account_id=(\d+)/)[1];
			if (!id) {
				sr.Logger.warn(`Account ${i + 1} has no account_id in cookie. Skipping...`);
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

			const accoundData = new Account({
				id,
				uid: String(starrailAccount.game_role_id),
				rank: starrailAccount.level,
				username: starrailAccount.nickname,
				region: starrailAccount.region,
				cookie: account.cookie,
				threshold: account.threshold,
				skipChecks: Boolean(account.uid === null)
			});

			Account.data.set(id, accoundData);
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
}
