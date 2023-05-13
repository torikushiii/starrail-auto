import got from "got";

export default class Discord {
    async send (data = {}, logged = false) {
        if (!Discord.webhookAuth) {
            return;
        }

        if (logged) {
            const res = await got({
                url: Discord.webhookAuth,
                method: "POST",
                responseType: "json",
                json: {
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
                }
            });

            if (res.statusCode !== 204) {
                throw new Error(`Discord webhook error: ${res.statusCode}`);
            }

            return true;
        }
        
        const embed = Discord.generateEmbed(data);
        const res = await got({
            url: Discord.webhookAuth,
            method: "POST",
            responseType: "json",
            json: {
                embeds: [embed],
                username: "Honkai: Star Rail",
                avatar_url: "https://i.imgur.com/o0hyhmw.png"
            }
        });

        if (res.statusCode !== 204) {
            throw new Error(`Discord webhook error: ${res.statusCode}`);
        }

        return true;
    }

    static generateEmbed (data = {}) {
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

    static get webhookAuth () {
        const auth = process.env.DISCORD_WEBHOOK;

        if (!auth || typeof auth !== "string") {
            return null;
        }

        return auth;
    }
};
