module.exports = (async () => {
	const gotModule = await import("got");

	const got = gotModule.default.extend({
		responseType: "json",
		http2: true,
		retry: {
			limit: 2
		},
		timeout: {
			request: 2500
		},
		mutableDefaults: true,
		throwHttpErrors: true,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
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

	return got;
})();
