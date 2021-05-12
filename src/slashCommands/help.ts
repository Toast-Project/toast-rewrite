import SlashCommand from "../util/classes/SlashCommand";
import ToastClient from "../util/classes/ToastClient";
import Embed from "../util/functions/embed";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "help",
            description: "View a list of Toast's commands.",
            category: "util"
        });
    }

    public async run(client: ToastClient, interaction) {
        const commands = client.slashCommands.filter(c => !c.conf.hidden);
        const unique = Array.from(new Set(commands.values()));

        const getCommands = type => unique.filter(c => c.help.category === type)
            .map(c => `\`${c.help.name}\``)
            .join(", ");

        const embed = Embed({
            description: `View command usage by doing /commandName`
        });

        embed.addField("Utility", getCommands("util"));

        return this.post(client, interaction, {
            type: 4,
            data: {
                embeds: [embed]
            }
        });
    }
}