import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "removewarn",
            description: "Remove the specified members warnings.",
            permissionLevel: 1,
            category: "mod",
            options: [
                {
                    "type": 6,
                    "name": "user",
                    "description": "User to warn",
                    "default": false,
                    "required": true
                },
                {
                    "type": 3,
                    "name": "id",
                    "description": "Warn ID to remove",
                    "default": false,
                    "required": false
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let user = interaction.options.getUser("user");
        let id = interaction.options.getString("id");

        if (!user) return interaction.reply({
            content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.",
            ephemeral: true
        });

        const guild = interaction.guild;
        const member = guild.members.cache.get(user.id);
        if (!member) return interaction.reply({
            content: "<:no:811763209237037058> The specified user is not a member of this server.",
            ephemeral: true
        });

        if (!id) {
            const deleted = await client.db.warnings.clear(guild.id, member.user.id);
            return interaction.reply(`Successfully cleared ${user.tag}'s \`${deleted.deletedCount}\` warnings.`);
        }

        const warning = await client.db.warnings.findOne({ guild: guild.id, _id: id });
        if (!warning) return interaction.reply({
            content: "The specified warning ID does not exist for the specified member.",
            ephemeral: true
        });

        await client.db.warnings.delete(id)
            .catch(e => {
                return interaction.reply({
                    content: `<:no:811763209237037058> The following error occurred while attempting to remove the warning:\n\`\`\`${e}\`\`\``,
                    ephemeral: true
                });
            });

        const warnCount = await client.db.warnings.count({ guild: guild.id, user: user.id });
        return interaction.reply(`Successfully deleted warning \`${id}\`. ${member.user.tag} now has \`${warnCount}\` warnings.`);
    }
}