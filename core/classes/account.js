import ClassTemplate from "./template.js";

export default class Account extends ClassTemplate {
	#uid;
	#cookie;
	#staminaThreshold;

	static data = new Map();
	static ACT_ID = "e202303301540311";

	constructor (data) {
		super();

		this.#uid = data.uid ?? Account.data.size;
		if (typeof this.#uid !== "number") {
			throw new sr.Error({
				message: "Account uid must be a number",
				args: {
					uid: data,
					type: {
						expected: "number",
						received: typeof this.#uid
					}
				}
			});
		}

		this.#cookie = data.cookie;
		if (typeof this.#cookie !== "string") {
			throw new sr.Error({
				message: "Account cookie must be a string",
				args: {
					cookie: data,
					type: {
						expected: "string",
						received: typeof this.#cookie
					}
				}
			});
		}

		this.#staminaThreshold = data.threshold;
		if (typeof this.#staminaThreshold !== "number") {
			throw new sr.Error({
				message: "Account staminaThreshold must be a number",
				args: {
					staminaThreshold: data,
					type: {
						expected: "number",
						received: typeof this.#staminaThreshold
					}
				}
			});
		}
	}

	static async initialize () {
		Account.data = new Map();
		await Account.loadData();
		return Account;
	}

	static async loadData () {
		const data = sr.Config.get("COOKIES");
        
		for (const account of data) {
			const object = new Account(account);
			Account.data.set(object.#uid, object);
		}
	}

	static async validate () {
		if (Account.data.size === 0) {
			throw new sr.Error({ message: "No account data found" });
		}

		const accounts = Account.data.values();
		for (const account of accounts) {
			const { statusCode, body } = await sr.Got({
				url: "https://sg-public-api.hoyolab.com/event/luna/os/info",
				headers: {
					Cookie: account.#cookie
				},
				searchParams: {
					act_id: Account.ACT_ID
				}
			});

			if (statusCode !== 200) {
				throw new sr.Error({
					message: "API error when getting sign info",
					args: {
						account: {
							uid: account.#uid
						},
						request: {
							statusCode,
							body
						}
					}
				});
			}

			if (body.retcode !== 0 && body.message !== "OK") {
				throw new sr.Error({
					message: "API error when getting sign info",
					args: {
						account: {
							uid: account.#uid
						},
						request: {
							statusCode,
							body
						}
					}
				});
			}

			if (body.retcode === 0 && body.message === "OK") {
				sr.Logger.info(`Account ${account.#uid} has been validated`);
				continue;
			}
		}

		return true;
	}

	static getActiveAccounts () {
		const accounts = Account.data.values();
		const activeAccounts = [];

		for (const account of accounts) {
			activeAccounts.push({
				uid: account.#uid,
				cookie: account.#cookie,
				threshold: account.#staminaThreshold
			});
		}

		return activeAccounts;
	}
}
