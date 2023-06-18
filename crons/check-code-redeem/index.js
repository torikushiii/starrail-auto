import config from "../../config.js";

export const definitions = {
	name: "check-code-redeem",
	expression: "0 */30 * * * *",
	description: "Check and redeem code",
	code: (async function codeRedeem () {
		if (!config?.notification?.codes) {
			this.stop();
			return;
		}
		
		const skippedCodes = ["STARRAILGIFT"];
		this.data.codes ??= [];
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
			const code = $code.find(".code").text();
			const rewards = $code.find(".rewards").text();
			codes.push({ code, rewards });
		}

		if (this.data.firstRun) {
			this.data.codes = codes;
			this.data.firstRun = false;
			return;
		}

		for (const code of codes) {
			if (skippedCodes.includes(code.code)) {
				continue;
			}

			if (!this.data.codes.some((c) => c.code === code.code)) {
				const message = `Code: ${code.code}\nRewards: ${code.rewards}`;

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
		}
	})
};
