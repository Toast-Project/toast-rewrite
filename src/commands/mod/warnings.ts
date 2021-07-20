import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";
import embed from "../../util/functions/embed";
import moment = require("moment");
import ms = require("ms");

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "warnings",
            description: "View the specified member's moderation history.",
            permissionLevel: 1,
            category: "mod",
            options: [
                {
                    "type": 6,
                    "name": "user",
                    "description": "User to warn",
                    "default": false,
                    "required": true
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let user = interaction.options.getUser("user");

        if (!user) return interaction.reply({
            content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.",
            ephemeral: true
        });

        const warnings = await client.db.warnings.find({ guild: interaction.guild.id, user: user.id });
        const mutes = await client.db.mutes.find({ guild: interaction.guild.id, user: user.id });

        if (!warnings.length && !mutes.length) return interaction.reply({
            content: "The specified member does not have any previous moderation history.",
            ephemeral: true
        });

        const warningsEmbed = embed({
            title: "Infractions",
            author: [user.tag, user.displayAvatarURL()]
        });

        let description = "";

        if (warnings.length) {
            for (const { _id, mod, reason } of warnings) {
                const { tag } = await client.users.fetch(mod);
                description += `ID: ${_id}\n> **Action:** warn\n> **Mod:** ${tag}\n> **Reason:** ${reason}\n`;
            }
        }

        if (mutes.length) {
            for (const { createdAt, duration, mod } of mutes) {
                const { tag } = await client.users.fetch(mod);
                description += `Date: ${moment(createdAt).format("MM-DD-YYYY")}\n> **Action:** mute\n> **Mod:** ${tag}\n> **Duration:** ${ms(duration, { long: true })}\n`;
            }
        }

        if (description.length > 4000) {
            description = description.substring(0, 4000);
            description += "\n*Embed character limit reached*";
        }

        warningsEmbed.setDescription(description);

        return interaction.reply({ embeds: [warningsEmbed] });
    }
}