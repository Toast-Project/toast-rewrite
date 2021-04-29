import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { Message } from "discord.js";
import Embed from "../../util/functions/embed";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "ping",
            description: "Pings the bot.",
            usage: ["!ping"],
            aliases: ["pong", "latency"]
        })
    }

    public async run(client: ToastClient, message: Message) {
        const m: Message = await this.message.channel.send(`${client.config.emotes.typing.full}`);

        const embed = await Embed({
            title: "Ping",
            description: `Pong! The connection latency is **${m.createdTimestamp - message.createdTimestamp}ms**.\nThe API latency is **${client.ws.ping}ms**.`
        });

        await m.delete();
        return await super.send(embed);
    }
}