import config from "../../config.js";
import ClassTemplate from "./template.js";

export default class Config extends ClassTemplate {
	#name;
	#value;

	static data = new Map();

	constructor (data) {
		super();

		this.#name = data.name;

		this.#value = data.value;
	}

	get name () { return this.#name; }
	get value () { return this.#value; }

	static async initialize () {
		Config.data = new Map();
		await Config.loadData();
		return Config;
	}

	static async loadData () {
		for (const [name, value] of Object.entries(config)) {
			const data = {
				name,
				value
			};

			const instance = new Config(data);
			Config.data.set(name, instance);
		}
	}

	static has (name) {
		const target = Config.get(name);

		return target !== undefined;
	}

	static get (name) {
		const target = Config.data.get(name);

		if (!target) {
			return undefined;
		}

		return target.value;
	}
}
