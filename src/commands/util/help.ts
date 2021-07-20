import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import Embed from "../../util/functions/embed";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "help",
            description: "View a list of Toast's commands.",
            category: "util",
            restricted: true
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const commands = client.commands.filter(c => !c.conf.hidden);
        const unique = Array.from(new Set(commands.values()));

        const getCommands = type => unique.filter(c => c.help.category === type)
            .map(c => `\`${c.help.name}\``)
            .join(", ");

        const embed = Embed({
            description: `View command usage by typing \`/<command>\``
        });

        embed.addField("Utility", getCommands("util"));
        embed.addField("Social", getCommands("social"));
        embed.addField("Moderation", getCommands("mod"));
        embed.addField("Configuration", getCommands("config"));
        embed.addField("Suggestions", getCommands("suggestions"));

        return interaction.reply({ embeds: [embed] });
    }
}