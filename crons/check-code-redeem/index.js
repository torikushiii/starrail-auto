let codeList = [];
let firstRun = true;

module.exports = {
	name: "check-code-redeem",
	expression: "0 */30 * * * *",
	description: "Check and redeem code from prydwen and HoyoLab",
	code: (async function codeRedeem () {
		if (!sr.Config.get("CHECK_CODE_REDEEM")) {
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

		try {
			const savedCodes = require("./codes.js");
			codeList = savedCodes;
		}
		catch {
			const path = "./crons/check-code-redeem/codes.js";
			fs.writeFileSync(path, `module.exports = ${JSON.stringify(skippedCodes, null, 4)}`);
			codeList = [...skippedCodes, ...codes];
		}

		if (firstRun) {
			firstRun = false;
			return;
		}

		const hoyoRes = await sr.Got({
			url: "https://bbs-api-os.hoyolab.com/community/painter/wapi/circle/channel/guide/material",
			searchParams: {
				game_id: 6
			},
			headers: {
				"x-rpc-app_version": "2.42.0",
				"x-rpc-client_type": 4
			}
		});

		if (hoyoRes.statusCode !== 200) {
			sr.Logger.json({
				message: "Error while retrieving redeem code from HoyoLab",
				args: {
					statusCode: hoyoRes.statusCode,
					body: hoyoRes.body
				}
			});

			return;
		}

		const exchangeGroup = hoyoRes.body.data.modules.find(i => i.exchange_group !== null);
		const pictureHash = [
			{
				hash: "77cb5426637574ba524ac458fa963da0_6409817950389238658",
				name: "Stellar Jade"
			},
			{
				hash: "7cb0e487e051f177d3f41de8d4bbc521_2556290033227986328",
				name: "Refined Aether"
			},
			{
				hash: "508229a94e4fa459651f64c1cd02687a_6307505132287490837",
				name: "Traveler's Guide"
			},
			{
				hash: "0b12bdf76fa4abc6b4d1fdfc0fb4d6f5_4521150989210768295",
				name: "Credit"
			}
		];

		const pendingCodes = [];
		const bonuses = (exchangeGroup && exchangeGroup.exchange_group && exchangeGroup.exchange_group.bonuses) ?? [];
		if (bonuses.length !== 0) {
			const avaliableCodes = bonuses.filter(i => i.code_status === "ON");
			for (const code of avaliableCodes) {
				const rewards = code.icon_bonuses.map(i => ({
					code: i.bonus_num,
					reward: `${i.bonus_num} ${pictureHash.find(j => i.icon_url.includes(j.hash))?.name}` ?? "Unknown"
				}));

				pendingCodes.push({ code: code.exchange_code, rewards: rewards.map(i => `${i.reward}`).join(" + ") });
			}
		}

		const newCodes = [];
		const hoyoCodes = pendingCodes.filter(i => !codeList.some(j => j.code === i.code));
		if (hoyoCodes.length !== 0) {
			newCodes.push(...hoyoCodes);
		}

		const prydwenCodes = codes.filter(i => !codeList.some(j => j.code === i.code));
		if (prydwenCodes.length !== 0) {
			newCodes.push(...prydwenCodes);
		}

		if (newCodes.length === 0) {
			return;
		}

		if (sr.Config.get("REDEEM_CODE")) {
			const accounts = sr.Account.getActiveAccounts();
			for (const account of accounts) {
				for (const code of newCodes) {
					const res = await sr.Got({
						url: "https://sg-hkrpg-api.hoyolab.com/common/apicdkey/api/webExchangeCdkeyHyl",
						searchParams: {
							cdkey: code.code,
							game_biz: "hkrpg_global",
							lang: "en",
							region: account.region,
							t: Date.now(),
							uid: account.uid
						},
						headers: {
							"x-rpc-app_version": "2.42.0",
							"x-rpc-client_type": 4,
							cookie: account.cookie
						}
					});

					if (res.statusCode !== 200) {
						sr.Logger.json({
							message: "Error while redeeming code",
							args: {
								code,
								statusCode: res.statusCode,
								body: res.body
							}
						});

						await new Promise(r => setTimeout(r, 5000));
						continue;
					}

					if (res.body.retcode !== 0) {
						sr.Logger.json({
							message: "Error while redeeming code",
							args: {
								code,
								body: res.body
							}
						});

						await new Promise(r => setTimeout(r, 5000));
						continue;
					}

					sr.Logger.json({
						message: "Code redeemed",
						args: {
							code,
							body: res.body
						}
					});

					await new Promise(r => setTimeout(r, 5000));
				}
			}
		}

		codeList.push(...newCodes);
		fs.unlinkSync("./crons/check-code-redeem/codes.js");
		fs.writeFileSync("./crons/check-code-redeem/codes.js", `module.exports = ${JSON.stringify(codeList, null, 4)}`);

		const baseUrl = "https://hsr.hoyoverse.com/gift";
		const message = newCodes.map(i => `Code: ${i.code}\nRewards: ${i.rewards}\nClaim Here: ${baseUrl}?code=${i.code}`).join("\n\n");
		sr.Logger.info(`New code(s) found:\n${message}`);

		if (sr.Discord && sr.Discord.active) {
			await sr.Discord.send({
				color: 0xBB0BB5,
				title: "Honkai: Star Rail New Code",
				author: {
					name: "PomPom",
					icon_url: "https://i.imgur.com/o0hyhmw.png"
				},
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
	})
};
