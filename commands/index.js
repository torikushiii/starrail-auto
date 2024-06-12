const loadCommands = (async function () {
	const fs = require("fs/promises");
	const path = require("path");
	const { platform } = require("os");

	const commandList = await fs.readdir(__dirname, {
		withFileTypes: true
	});

	const definitions = [];
	const failed = [];

	const dirList = commandList.filter((entry) => entry.isDirectory());
	for (const dir of dirList) {
		let def;
		const baseDir = platform() === "win32" ? `file://${__dirname}` : __dirname;
		const defPath = path.join(baseDir, dir.name, "index.js");
		try {
			const codeData = await import(defPath);
			def = codeData.default;
		}
		catch (e) {
			console.error(e);
			failed.push(dir.name);
		}

		if (def) {
			definitions.push(def);
		}
	}

	return {
		definitions,
		failed
	};
});

module.exports = {
	loadCommands
};
