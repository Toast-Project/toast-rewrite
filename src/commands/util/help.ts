import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { Message, MessageEmbed } from "discord.js";
import Embed from "../../util/functions/embed";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "help",
            description: "Sends a list of commands and support information.",
            usage: ["!help [command]", "!help ping", "!help"],
            aliases: ["h"],
            args: { command: { type: "command" } }
        });
    }

    public async run(client: ToastClient, message: Message, [command]) {
        const prefix: string = message.guild.data.prefix || "t!";

        if (command) {
            const embed = Embed({
                title: `${command.help.name} ${command.conf.aliases?.length ? "(" + command.conf.aliases?.join(", ") + ")" : ""}`,
                description: command.help.description,
                fields: {
                    usage: ["Usage", command.help.usage.map(str => `\`${str}\``).join("\n").replace(/!/g, prefix)],
                    permissions: ["Permissions", this.client.config.permissionLevels[command.conf.permLevel] || "None"]
                }
            });

            return await super.send(embed);
        }

        const embed: MessageEmbed = Embed({
            title: "Help"
        });

        const commands = client.commands.filter(c => !c.conf.hidden);
        const unique = Array.from(new Set(commands.values()));

        const getCommands = type => unique.filter(c => c.help.category === type)
            .map(c => `\`${c.help.name}\``)
            .join(", ");

        embed.addField("Utility", getCommands("util"));

        return await super.send(embed);
    }
}