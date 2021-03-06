import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";
import ms = require("ms");

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "remindme",
            description: "Create a reminder.",
            category: "util",
            options: [
                {
                    "type": 3,
                    "name": "duration",
                    "description": "When the bot will remind you (eg. 10m)",
                    "default": false,
                    "required": true
                },
                {
                    "type": 3,
                    "name": "text",
                    "description": "What you want to be reminded about",
                    "default": false,
                    "required": true
                }
            ],
            restricted: true
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let duration: any = interaction.options.getString("duration");
        let text = interaction.options.getString("text");

        duration = ms(duration.toString());

        if (!duration) return interaction.reply({
            content: "<:no:811763209237037058> You must provide a valid duration (eg. 10m or 8h).",
            ephemeral: true
        });

        await client.db.reminders.insert({
            _id: client.randomId(),
            user: interaction.member.user.id,
            channel: interaction.channelId,
            text,
            duration,
            createdAt: Date.now()
        });

        return interaction.reply(`<:check:811763193453477889> I will remind you in \`${ms(duration, { long: true })}\`.`);
    }
}