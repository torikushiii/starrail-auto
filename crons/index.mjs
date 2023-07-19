import { definitions as CodeRedeem } from "./check-code-redeem/index.js";
import { definitions as Stamina } from "./stamina/index.mjs";
import { definitions as CheckIn } from "./check-in/index.mjs";
import { definitions as Expedition } from "./expedition/index.mjs";
import { definitions as DailyReminder } from "./dailies-reminder/index.mjs";
import { definitions as WeekliesReminder } from "./weeklies-reminder/index.mjs";

export const definitions = [
	CodeRedeem,
	Stamina,
	CheckIn,
	Expedition,
	DailyReminder,
	WeekliesReminder
];

export default definitions;
