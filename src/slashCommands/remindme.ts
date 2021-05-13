import SlashCommand from "../util/classes/SlashCommand";
import ToastClient from "../util/classes/ToastClient";
import ms = require("ms");

export default class extends SlashCommand {
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
            ]
        });
    }

    public async run(client: ToastClient, interaction) {
        let [duration, text] = interaction.data.options.map(v => v.value);
        duration = ms(duration);

        if (!duration) return this.post(client, interaction, {
            type: 4,
            data: {
                flags: 1 << 6,
                content: "You must provide a valid duration (eg. 10m or 8h)."
            }
        });

        await client.db.reminders.insert({
            _id: client.randomId(),
            user: interaction.member.user.id,
            channel: interaction.channel_id,
            text,
            duration,
            createdAt: Date.now()
        });

        return this.post(client, interaction, {
            type: 4,
            data: {
                content: `<:check:811763193453477889> I will remind you in \`${ms(duration, { long: true })}\`.`
            }
        });
    }
}