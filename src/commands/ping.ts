import Command from "../util/classes/Command";
import ToastClient from "../util/classes/ToastClient";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "ping",
            description: "Pings the bot.",
            usage: ["!ping"]
        })
    }

    async run(message, args) {
        return await super.send(`Connection Latency: **${Date.now() - message.createdAt}**\nAPI Latency: **${this.client.ws.ping}**`);
    }
}