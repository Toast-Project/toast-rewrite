import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import embed from "../../util/functions/embed";
import { CommandInteraction } from "discord.js";
import { inspect } from "util";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "eval",
            description: "Run JavaScript code.",
            permissionLevel: 5,
            options: [
                {
                    "type": 3,
                    "name": "code",
                    "description": "Code to run",
                    "default": false,
                    "required": true
                }
            ],
            hidden: true,
            restricted: true
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        if (!client.config.developers.includes(interaction.user.id)) return;

        let ev = interaction.options.getString("code");

        if (ev === "client.token" || ev === "client.env.token" || ev === "token" || ev === "admin.token") return interaction.reply({
            content: "Blacklisted eval content",
            ephemeral: true
        });

        if (/\s-s$/.exec(ev) !== null) {
            ev = ev.replace(/\s-s$/, "");
        }
        if (/\s-h$/.exec(ev) !== null) {
            ev = ev.replace(/\s-h$/, "");
        }
        if (/\s-s$/.exec(ev) !== null) {
            ev = ev.replace(/\s-s$/, "");
        }

        let evaled;
        try {
            evaled = await eval(ev);
            if (typeof evaled !== "string") {
                evaled = inspect(evaled);
            }
        } catch (e) {
            evaled = e.stack.toString();
        }

        const evalEmbed = embed({
            title: "Eval",
            description: "```xl\n" + clean(evaled).slice(0, 1990) + "```",
            timestamp: true
        });

        return interaction.reply({ embeds: [evalEmbed], ephemeral: true });
    }
}

function clean(text) {
    return typeof (text) !== "string"
        ? text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
        : text;
}