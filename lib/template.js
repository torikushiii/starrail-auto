export default class ClassTemplate {
	destroy () {}

	static data = [];

	static async initialize () {
		await this.loadData();
		return this;
	}

	static async loadData () {
		throw new Error("loadData method must be implemented in child class");
	}

	static async get () {
		throw new Error("get method must be implemented in child class");
	}

	static async send () {
		throw new Error("send method must be implemented in child class");
	}

	static destroy () {
		this.data = null;
	}
}
