import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import userPermissions from "../../util/functions/userPermissions";
import { CommandInteraction, GuildMember } from "discord.js";
import { notify } from "../../util/functions/log";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "kick",
            description: "Kick a user from the server.",
            permissionLevel: 1,
            category: "mod",
            options: [
                {
                    "type": 6,
                    "name": "user",
                    "description": "User to kick",
                    "default": false,
                    "required": true
                },
                {
                    "type": 3,
                    "name": "reason",
                    "description": "Kick reason",
                    "default": false,
                    "required": false
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
                content: "<:no:811763209237037058> Your permission level must be higher than the specified user in order to kick them.",
                ephemeral: true
            });
        }

        await notify(interaction.guild, user, "kick", Date.now(), null, <string>reason || "No reason provided.")
            .catch(e => e);

        await member.kick(reason?.toString() || "No reason provided")
            .catch(e => {
                return interaction.reply({
                    content: `<:no:811763209237037058> The following error occurred while attempting to kick this member:\n\`\`\`${e}\`\`\``,
                    ephemeral: true
                });
            });

        return interaction.reply(`<:check:811763193453477889> \`${user.tag}\` has been kicked${reason ? ` for \`${reason}\`.` : "."}`);
    }
}