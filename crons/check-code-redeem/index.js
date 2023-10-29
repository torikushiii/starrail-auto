export const definitions = {
	name: "check-code-redeem",
	expression: "0 */30 * * * *",
	description: "Check and redeem code",
	code: (async function codeRedeem () {
		if (!sr.Config.get("CHECK_CODE_REDEEM")) {
			this.stop();
			return;
		}
		
		const fs = await import("fs");
		const skippedCodes = [
			{
				code: "STARRAILGIFT",
				rewards: "50 Stellar Jades + EXP materials"
			},
			{
				code: "BTN5EL69P6K3",
				rewards: "50 Stellar Jades + 10k credits"
			}
		];

		this.data.codes ??= [];
		this.data.firedCodes ??= [];
		this.data.firstRun ??= true;

		const res = await sr.Got({
			url: "https://www.prydwen.gg/star-rail/",
			responseType: "text"
		});

		const codes = [];
		const $ = sr.Utils.cheerio(res.body);

		const $codes = $(".codes .box");
		for (let i = 0; i < $codes.length; i++) {
			const $code = $($codes[i]);
			const code = $code.find(".code").text().replace(" NEW!", "");
			const rewards = $code.find(".rewards").text();
			codes.push({ code, rewards });
		}

		let savedCodes;
		try {
			const codeFile = await import("./codes.js");
			savedCodes = codeFile.default;
		}
		catch {
			const codeData = [...skippedCodes, ...codes];
			
			const path = "./crons/check-code-redeem/codes.js";
			fs.writeFileSync(path, `export default ${JSON.stringify(codeData, null, 4)}`);

			savedCodes = codes;
		}

		if (this.data.firstRun) {
			this.data.codes = codes;
			this.data.firstRun = false;
			return;
		}

		const newCodes = this.data.codes.filter((c) => !savedCodes.some((sc) => sc.code === c.code));
		if (newCodes.length === 0) {
			return;
		}

		fs.writeFileSync("./crons/check-code-redeem/codes.js", `export default ${JSON.stringify(codes, null, 4)}`);

		for (const code of newCodes) {
			if (skippedCodes.some((sc) => sc.code === code.code) || this.data.firedCodes.includes(code.code)) {
				continue;
			}

			const message = `Code: ${code.code}\nRewards: ${code.rewards}`;

			this.data.firedCodes.push(code.code);
			sr.Logger.info(`New code: ${code.code} - ${code.rewards}`);

			if (sr.Discord && sr.Discord.active) {
				await sr.Discord.send({
					color: 0xBB0BB5,
					title: "Honkai: Star Rail New Code",
					description: message,
					timestamp: new Date(),
					footer: {
						text: "Honkai: Star Rail New Code"
					}
				});
			}

			if (sr.Telegram && sr.Telegram.active) {
				await sr.Telegram.send(message);
			}
		}
	})
};
