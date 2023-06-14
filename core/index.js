export default (async function () {
	globalThis.sr = {};

	const files = [
		"lib/logger",
		"lib/got",

		"classes/cron",
		"object/error",
		"classes/account",

		"hoyo/check-in",
		"hoyo/stamina"
	];

	for (const file of files) {
		const [type, name] = file.split("/");

		if (type === "lib") {
			switch (name) {
				case "logger": {
					const { default: winston } = await import("../lib/winston.js");
					sr.Logger = winston;
					break;
				}
				
				case "got": {
					const { default: got } = await import("../lib/got.js");
					sr.Got = got;
					break;
				}
			}
		}
		else if (type === "object") {
			const { default: component } = await import(`./${file}.js`);
			const name = component.name.replace("Custom", "");

			sr[name] = component;
		}
		else if (type === "classes") {
			const { default: component } = await import(`./${file}.js`);
			const name = component.name.replace("Custom", "");

			sr[name] = await component.initialize();
		}
		else if (type === "hoyo") {
			const { default: component } = await import(`./${file}.js`);
			const name = component.name.replace("Custom", "");

			sr[name] = await component.initialize();
		}
	}

	return globalThis.sr;
});
