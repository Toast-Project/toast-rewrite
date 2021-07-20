import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import userPermissions from "../../util/functions/userPermissions";
import { CommandInteraction, GuildMember } from "discord.js";
import { notify } from "../../util/functions/log";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "warn",
            description: "Warn a member in the server.",
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
                    "name": "reason",
                    "description": "Reason for warning",
                    "default": false,
                    "required": true
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let user = interaction.options.getUser("user");
        let reason = interaction.options.getString("reason");

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

        const author = <GuildMember>interaction.member;

        const authorPermLevel = await userPermissions(client, interaction, author);
        const targetPermLevel = member ? await userPermissions(client, interaction, member) : 0;

        if (targetPermLevel >= authorPermLevel) {
            return interaction.reply({
                content: "<:no:811763209237037058> Your permission level must be higher than the specified user in order to warn them.",
                ephemeral: true
            });
        }

        const warnCount = await client.db.warnings.getCount(guild.id, user.id);
        if (warnCount >= 20) return interaction.reply({
            content: "<:no:811763209237037058> The specified user is currently at the maximum amount of warnings (20).",
            ephemeral: true
        });

        const warning = {
            _id: client.randomId(),
            guild: guild.id,
            mod: author.user.id,
            user: user.id,
            userTag: user.tag,
            modTag: author.user.tag,
            reason
        }

        await client.db.warnings.insert(warning)
            .catch(e => {
                return interaction.reply({
                    content: `<:no:811763209237037058> The following error occurred while attempting to warn this member:\n\`\`\`${e}\`\`\``,
                    ephemeral: true
                });
            });

        await notify(interaction.guild, user, "warn", Date.now(), null, reason || "No reason provided.")
            .catch(e => e);

        return interaction.reply(`<:check:811763193453477889> \`${member.user.tag}\` has been warned for \`${reason}\`.`);
    }
}