import gotModule from "got";

const got = gotModule.extend({
	responseType: "json",
	retry: {
		limit: 0
	},
	timeout: {
		request: 30000
	},
	mutableDefaults: true,
	throwHttpErrors: true,
	headers: {
		"User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36"
	},
	hooks: {
		beforeError: [
			(e) => new sr.Error.GenericRequest({
				body: e.response?.body ?? null,
				statusCode: e.response?.statusCode ?? null,
				statusMessage: e.response?.statusMessage ?? null,
				hostname: e.options?.url.hostname ?? null,
				message: e.message,
				stack: e.stack
			})
		]
	}
});

export default got;
