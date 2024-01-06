const crypto = require("crypto");
const { load } = require("cheerio");

module.exports = class UtilsSingleton extends require("./template.js") {
	static DS_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";
	
	static timeUnits = {
		h: { m: 60, s: 3600, ms: 3600.0e3 },
		m: { s: 60, ms: 60.0e3 },
		s: { ms: 1.0e3 }
	};

	/**
	 * @inheritdoc
	 * @returns {UtilsSingleton}
	 */
	static singleton () {
		if (!UtilsSingleton.module) {
			UtilsSingleton.module = new UtilsSingleton();
		}

		return UtilsSingleton.module;
	}

	formatTime (seconds = 0) {
		const array = [];

		if (seconds >= UtilsSingleton.timeUnits.h.s) {
			const hours = Math.floor(seconds / UtilsSingleton.timeUnits.h.s);
			seconds -= hours * UtilsSingleton.timeUnits.h.s;
			array.push(`${hours} hr`);
		}
        
		if (seconds >= UtilsSingleton.timeUnits.m.s) {
			const minutes = Math.floor(seconds / UtilsSingleton.timeUnits.m.s);
			seconds -= minutes * UtilsSingleton.timeUnits.m.s;
			array.push(`${minutes} min`);
		}

		if (seconds >= 0 || array.length === 0) {
			array.push(`${this.round(seconds, 3)} sec`);
		}

		return array.join(", ");
	}

	round (number, precision = 0) {
		return Math.round(number * (10 ** precision)) / (10 ** precision);
	}

	getAccountRegion (uid) {
		const region = uid.toString().slice(0, 1);
		switch (region) {
			case "9":
				return `prod_official_cht`;
			case "8":
				return `prod_official_asia`;
			case "7":
				return `prod_official_eur`;
			case "6":
				return `prod_official_usa`;
			default:
				return false;
		}
	}

	formattedAccountRegion (region) {
		switch (region) {
			case "prod_official_cht":
				return "TW";
			case "prod_official_asia":
				return "SEA";
			case "prod_official_eur":
				return "EU";
			case "prod_official_usa":
				return "NA";
			default:
				return false;
		}
	}

	cheerio (html) {
		return load(html);
	}

	generateDS () {
		const time = (Date.now() / 1000).toFixed(0);
		const random = this.randomString();
		const hash = this.hash(`salt=${UtilsSingleton.DS_SALT}&t=${time}&r=${random}`);

		return `${time},${random},${hash}`;
	}

	randomString () {
		let result = "";
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const length = 6;

		for (let i = 0; i < length; i++) {
			result += chars[Math.floor(Math.random() * chars.length)];
		}

		return result;
	}

	hash (string) {
		return crypto
			.createHash("md5")
			.update(string)
			.digest("hex");
	}
};
