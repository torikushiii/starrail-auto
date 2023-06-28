import path from "path";
import fs from "fs/promises";

export default (async function () {
	const commandList = await fs.readdir(path.join(process.cwd(), "commands"), {
		withFileTypes: true
	});

	const definitions = [];
	const failed = [];

	const dirList = commandList.filter((entry) => entry.isDirectory());
	for (const dir of dirList) {
		let def;
		const defPath = path.join(process.cwd(), "commands", dir.name, "index.js");
		try {
			const codeData = await import(defPath);
			def = codeData.default;
		}
		catch {
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
})();
