import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, Snowflake } from "discord.js";

export default class extends SlashCommand {
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
        let [user, id] = interaction.options.map(v => v.value);

        const resolvedUser = await client.users.fetch(<Snowflake>user)
            .catch(e => {
                return interaction.reply({ content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.", ephemeral: true });
            });

        if (!resolvedUser) return interaction.reply({ content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.", ephemeral: true });

        const guild = interaction.guild;
        const member = guild.members.cache.get(<Snowflake>user);

        if (!id) {
            const deleted = await client.db.warnings.clear(guild.id, member.user.id);
            return interaction.reply(`Successfully cleared ${resolvedUser.tag}'s \`${deleted.deletedCount}\` warnings.`);
        }

        const warning = await client.db.warnings.findOne({ guild: guild.id, _id: id });
        if (!warning) return interaction.reply({ content: "The specified warning ID does not exist for the specified member.", ephemeral: true });

        await client.db.warnings.delete(id)
            .catch(e => {
                return interaction.reply({ content: `<:no:811763209237037058> The following error occurred while attempting to remove the warning:\n\`\`\`${e}\`\`\``, ephemeral: true });
            });

        const warnCount = await client.db.warnings.count({ guild: guild.id, user: resolvedUser.id });
        return interaction.reply(`Successfully deleted warning \`${id}\`. ${member.user.tag} now has \`${warnCount}\` warnings.`);
    }
}