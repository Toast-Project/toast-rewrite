const Command = require("../util/classes/Command");
const Embed = require("../util/classes/Embed");

class Ping extends Command {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "Pings the bot.",
            usage: ["!ping"],
            aliases: ["pong"],
        });
    }

    run(message, args) {
        const embed = new Embed({
            title: "Ping",
            description: `Connection Latency: **${Date.now() - message.createdAt}**\nAPI Latency: **${this.client.ws.ping}**`
        });

        super.send(embed);
    }
}

module.exports = Ping;