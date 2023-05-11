import { CronJob } from "cron";
import { config } from "dotenv";
import Discord from "./discord.js";
import got, { HTTPError, TimeoutError } from "got";

config();

const COOKIE = process.env.COOKIE;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

const ACT_ID = "e202303301540311";
const BASE_URL = "https://sg-public-api.hoyolab.com/event/luna/os";

class StarRail {
    constructor () {
        this.cookie = COOKIE;
        this.baseUrl = BASE_URL;
    }

    static async sign () {
        const res = await got({
            method: "POST",
            url: `${BASE_URL}/sign`,
            responseType: "json",
            headers: {
                "User-Agent": StarRail.userAgent,
                Cookie: COOKIE
            },
            json: {
                act_id: ACT_ID
            }
        });

        if (res.statusCode !== 200) {
            throw new Error(`HTTP error: ${res.statusCode}`);
        }

        return res.body;
    }

    async run () {
        const cookie = this.cookie;
        if (!cookie) {
            throw new Error("cookie is required");
        }
        else if (typeof cookie !== "string") {
            throw new Error("cookie must be a string");
        }

        const info = await StarRail.getInfo();
        if (info.retcode !== 0 && message !== "OK") {
            throw new Error(`API error: ${info.message}`);            
        }

        const awards = await StarRail.awards();
        if (awards.length === 0) {
            throw new Error("There's no awards to claim (?)");
        }

        const data = {
            today: info.data.today,
            total: info.data.total_sign_day,
            issigned: info.data.is_sign,
            missed: info.data.sign_cnt_missed
        };

        const discord = new Discord();
        if (data.issigned) {
            await discord.send({ message: "You've already checked in today, Trailblazer~" }, true);
            return;
        }

        const totalSigned = data.total;
        const awardData = {
            name: awards[totalSigned].name,
            count: awards[totalSigned].cnt
        };

        const sign = await StarRail.sign();
        if (sign.retcode !== 0 && sign.message !== "OK") {
            throw new Error(`API error: ${sign.message}`);
        }

        console.log(`Signed in successfully! You have signed in for ${data.total} days!`);
        console.log(`You have received ${awardData.count}x ${awardData.name}!`);

        if (!DISCORD_WEBHOOK || typeof DISCORD_WEBHOOK !== "string") {
            console.log("No Discord webhook provided, skipping...");
            return true;
        }

        await discord.send({
            signed: data.total,
            award: awardData
        });

        return true;
    }

    static async getInfo () {
        try {
            const res = await got({
                url: `${BASE_URL}/info`,
                responseType: "json",
                headers: {
                    "User-Agent": StarRail.userAgent,
                    Cookie: COOKIE
                },
                searchParams: {
                    act_id: ACT_ID
                }
            });
    
            if (res.statusCode !== 200) {
                throw new Error(`HTTP error: ${res.statusCode}`);
            }
    
            return res.body;
        }
        catch (e) {
            if (e instanceof HTTPError) {
                throw new Error(`HTTP error: ${e.message}`);
            }
            else if (e instanceof TimeoutError) {
                return StarRail.getInfo();
            }

            throw e;
        }
    }

    static async awards () {
        const res = await got({
            url: `${BASE_URL}/home`,
            responseType: "json",
            headers: {
                "User-Agent": StarRail.userAgent,
                Cookie: COOKIE
            },
            searchParams: {
                act_id: ACT_ID
            }
        });

        if (res.statusCode !== 200) {
            throw new Error(`HTTP error: ${res.statusCode}`);
        }

        if (res.body.retcode !== 0 && res.body.message !== "OK") {
            throw new Error(`API error: ${res.body.message}`);
        }

        return res.body.data.awards;
    }

    get userAgent () {
        return "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36";
    }
};

export default StarRail;

/**
 * Adjust the time to your liking.
 * Or when does the daily reset happen in your timezone.
 */
const job = new CronJob("0 0 0 * * *", async () => {
    const starRail = new StarRail();
    await starRail.run();
});

job.start();

console.log("Cron job started");
