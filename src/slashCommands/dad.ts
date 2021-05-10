import SlashCommand from "../util/classes/SlashCommand";
import ToastClient from "../util/classes/ToastClient";
import Embed from "../util/functions/embed";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "dad",
            description: "dad",
            permissionLevel: 2
        });
    }

    public async run(client: ToastClient, interaction) {
        const embed = Embed({
            title: "dad",
            description: `Permission level test`
        });

        return client["api"]["interactions"](interaction.id)(interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    embeds: [embed]
                }
            }
        });
    }
}