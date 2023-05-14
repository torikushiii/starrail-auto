// Your HSR Cookie should look like this
// Ensure the name of the cookie is COOKIE
// _MHYUUID=xxxx ; mi18nLang=en-us ; ltoken=xxxx ; ltuid=xxxx ; cookie_token=xxxx ; account_id=xxxx

const scriptProperties = PropertiesService.getScriptProperties();

const COOKIE = scriptProperties.getProperty("COOKIE");
const DISCORD_WEBHOOK = scriptProperties.getProperty("DISCORD_WEBHOOK");

const ACT_ID = "e202303301540311";
const BASE_URL = "https://sg-public-api.hoyolab.com/event/luna/os";

class Discord {
  constructor(DISCORD_WEBHOOK) {
    this.webhook = DISCORD_WEBHOOK;
  }

  async send(data = {}, logged = false) {
    if (!this.webhook) {
      return;
    }

    if (logged) {
      const res = UrlFetchApp.fetch(this.webhook, {
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify({
          embeds: [
            {
              title: "Honkai: Star Rail Auto Check-in",
              author: {
                name: "Honkai: Star Rail",
                icon_url: "https://i.imgur.com/o0hyhmw.png",
              },
              description: data.message,
              color: 0xbb0bb5,
              timestamp: new Date(),
              footer: {
                text: "Honkai: Star Rail Auto Check-in"
              },
            }
          ],
          username: "Honkai: Star Rail",
          avatar_url: "https://i.imgur.com/o0hyhmw.png"
        })
      });

      if (res.getResponseCode() !== 204) {
        throw new Error(`Discord webhook error: ${res.getResponseCode()}`);
      }

      return true;
    }

    const embed = Discord.generateEmbed(data);
    const res = UrlFetchApp.fetch(this.webhook, {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify({
        embeds: [embed],
        username: "Honkai: Star Rail",
        avatar_url: "https://i.imgur.com/o0hyhmw.png"
      })
    });

    if (res.getResponseCode() !== 204) {
      throw new Error(`Discord webhook error: ${res.getResponseCode()}`);
    }

    return true;
  }

  static generateEmbed(data = {}) {
    return {
      title: "Honkai: Star Rail Auto Check-in",
      author: {
        name: "Honkai: Star Rail",
        icon_url: "https://i.imgur.com/o0hyhmw.png",
      },
      description: `Today's reward: ${data.award.name} x${data.award.count}`
        + `\nTotal signed: ${data.signed}`,
      color: 0xbb0bb5,
      timestamp: new Date(),
      footer: {
        text: "Honkai: Star Rail Auto Check-in"
      },
    };
  }
}

class StarRail {
  constructor() {
    this.cookie = COOKIE;
    this.baseUrl = BASE_URL;
  }

  static async sign() {
    const payload = {
      act_id: ACT_ID
    };

    const options = {
      method: "POST",
      headers: {
        "User-Agent": StarRail.userAgent,
        Cookie: COOKIE
      },
      payload: JSON.stringify(payload)
    };

    const res = UrlFetchApp.fetch(`${BASE_URL}/sign`, options);

    if (res.getResponseCode() !== 200) {
      throw new Error(`Sign HTTP error: ${res.getResponseCode()}`);
    }

    const body = JSON.parse(res.getContentText());
    if (body.retcode !== 0 && body.message !== "OK") {
      throw new Error(`Sign API error: ${body.message}`);
    }

    return true;
  }

  async run() {
    const cookie = this.cookie;
    if (!cookie) {
      throw new Error("cookie is required");
    }
    else if (typeof cookie !== "string") {
      throw new Error("cookie must be a string");
    }

    const info = await StarRail.getInfo();
    const awards = await StarRail.awards();
    if (awards.length === 0) {
      throw new Error("There's no awards to claim (?)");
    }

    const data = {
      today: info.today,
      total: info.total_sign_day,
      issigned: info.is_sign,
      missed: info.sign_cnt_missed
    };

    const discord = new Discord(DISCORD_WEBHOOK);
    if (data.issigned) {
      await discord.send({ message: "You've already checked in today, Trailblazer~" }, true);
      return {
        message: "You've already checked in today, Trailblazer~"
      };
    }

    const totalSigned = data.total;
    const awardData = {
      name: awards[totalSigned].name,
      count: awards[totalSigned].cnt
    };

    const sign = await StarRail.sign();
    if (sign) {
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

      return {
        message: `Signed in successfully! You have signed in for ${data.total} days!`,
      };
    }
  }

  static async getInfo() {
    const options = {
      headers: {
        "User-Agent": StarRail.userAgent,
        Cookie: COOKIE
      },
      muteHttpExceptions: true,
      method: "GET"
    };

    const res = UrlFetchApp.fetch(`${BASE_URL}/info?act_id=${ACT_ID}`, options);

    if (res.getResponseCode() !== 200) {
      throw new Error(`Info HTTP error: ${res.getResponseCode()}`);
    }

    const body = JSON.parse(res.getContentText());
    if (body.retcode !== 0 && body.message !== "OK") {
      throw new Error(`Info API error: ${body.message}`);
    }

    return body.data;
  }

  static async awards() {
    const options = {
      headers: {
        "User-Agent": StarRail.userAgent,
        Cookie: COOKIE
      },
      muteHttpExceptions: true,
      method: "GET"
    };

    const res = UrlFetchApp.fetch(`${BASE_URL}/home?act_id=${ACT_ID}`, options);

    if (res.getResponseCode() !== 200) {
      throw new Error(`HTTP error: ${res.getResponseCode()}`);
    }

    const body = JSON.parse(res.getContentText());

    if (body.retcode !== 0 && body.message !== "OK") {
      throw new Error(`API error: ${body.message}`);
    }

    return body.data.awards;
  }

  static get userAgent() {
    return "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36";
  }
}

function run() {
  const starRail = new StarRail();
  const run = starRail.run()
    .then((res) => {
      console.log(res.message);
    })
    .catch((err) => {
      console.error(err);
    });
}