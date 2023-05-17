import gotModule from "got";
import logger from "./winston.js";

const got = gotModule.extend({
	prefixUrl: "https://sg-public-api.hoyolab.com/event/luna/os",
	responseType: "json",
	retry: {
		limit: 0
	},
	timeout: {
		request: 30000
	},
	mutableDefaults: true,
	throwHttpErrors: false,
	headers: {
		"User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36"
	},
	hooks: {
		beforeError: [
			err => {
				if (!err || err.code !== "ETIMEDOUT") {
					return err;
				}

				logger.json({
					origin: "external",
					context: {
						code: err.code,
						responseType: err.options?.responseType ?? null,
						timeout: err.options?.timeout ?? null,
						url: err.options?.url?.toString?.() ?? null
					}
				});
                
				return err;
			}
		]
	}
});

export default got;
