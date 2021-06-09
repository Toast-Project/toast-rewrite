import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import Embed from "../../util/functions/embed";
import { CommandInteraction } from "discord.js";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "ping",
            description: "View the Discord API latency",
            category: "util",
            restricted: true
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const embed = Embed({
            title: "Ping",
            description: `Pong! The Discord API latency is ${client.ws.ping}ms.`
        });

        return interaction.reply(embed);
    }
}