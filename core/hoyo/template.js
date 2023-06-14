export default class HoyoTemplate {
	static data = [];

	static async initialize () {
		await this.loadData();
		return this;
	}

	static async loadData () {
		throw new sr.Error({
			message: "loadData() must be implemented in the child class",
			args: {
				name: this.name
			}
		});
	}
}
