import { load } from "cheerio";
import SingletonClass from "./template.js";

export default class UtilsSingleton extends SingletonClass {
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

	cheerio (html) {
		return load(html);
	}
}
