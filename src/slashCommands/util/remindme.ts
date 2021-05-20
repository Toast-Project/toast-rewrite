import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import ms = require("ms");
import { CommandInteraction } from "discord.js";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "remindme",
            description: "Create a reminder.",
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
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let [duration, text] = interaction.options.map(v => v.value);
        duration = ms(duration.toString());

        if (!duration) return interaction.reply("<:no:811763209237037058> You must provide a valid duration (eg. 10m or 8h).", { ephemeral: true });

        await client.db.reminders.insert({
            _id: client.randomId(),
            user: interaction.member.user.id,
            channel: interaction.channelID,
            text,
            duration,
            createdAt: Date.now()
        });

        return interaction.reply(`<:check:811763193453477889> I will remind you in \`${ms(duration, { long: true })}\`.`);
    }
}