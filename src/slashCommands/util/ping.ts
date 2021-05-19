import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import Embed from "../../util/functions/embed";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "ping",
            description: "View the Discord API latency",
        });
    }

    public async run(client: ToastClient, interaction) {
        const embed = Embed({
            title: "Ping",
            description: `Pong! The Discord API latency is ${client.ws.ping}ms.`
        });

        return this.post(client, interaction, {
            type: 4,
            data: {
                embeds: [embed]
            }
        });
    }
}