import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import ms = require("ms");
import embed from "../../util/functions/embed";
import { CommandInteraction } from "discord.js";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "reminders",
            description: "View your upcoming reminders.",
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const reminders = await client.db.reminders.find({ user: interaction.member.user.id });

        if (!reminders || !reminders.length) return interaction.reply("You have no upcoming reminders.", { ephemeral: true });

        const remindEmbed = embed({
            title: "Upcoming Reminders"
        });

        let description = "";
        for (const reminder of reminders){
            const { createdAt, duration, text } = reminder;
            description += `• ${ms((duration + createdAt) - Date.now(), { long: true })}\n\`\`\`\n${text}\n\`\`\`\n`;
        }

        remindEmbed.setDescription(description);

        return interaction.reply(remindEmbed);
    }
}