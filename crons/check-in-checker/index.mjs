export const definitions = {
	name: "check-in-checker",
	expression: "0 */31 * * * *", // to avoid conflict with check-in
	description: "This cron is to check wether you have checked in or not.",
	code: (async function checkInChecker () {
		const checkIn = await sr.CheckIn.getSignData();
		const awards = sr.CheckIn.getAwards();
		
		const data = [];
		for (const account of checkIn) {
			if (account.data.issigned) {
				continue;
			}

			const sign = await sr.CheckIn.sign(account.cookie);
			if (sign === false) {
				continue;
			}

			const totalSigned = account.data.total;
			const awardData = {
				name: awards[totalSigned].name,
				count: awards[totalSigned].cnt,
				icon: awards[totalSigned].icon
			};

			data.push({
				uid: account.uid,
				username: account.username,
				signed: totalSigned + 1,
				result: "OK",
				award: awardData
			});
		}

		if (data.length === 0) {
			return;
		}

		await sr.Discord.prepareMessage(data, { checkIn: true });
	})
};
