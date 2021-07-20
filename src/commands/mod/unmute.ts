import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "unmute",
            description: "Unmute a member in the server.",
            permissionLevel: 1,
            category: "mod",
            options: [
                {
                    "type": 6,
                    "name": "user",
                    "description": "User to unmute",
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

        const guild = interaction.guild;
        const member = guild.members.cache.get(user.id);
        if (!member) return interaction.reply("<:no:811763209237037058> The specified user is not a member of this server.");

        let muteRole = interaction.guild.data?.roles?.mute;

        muteRole = guild.roles.cache.get(muteRole);
        if (!muteRole) return interaction.reply({
            content: "<:no:811763209237037058> This server does not have a mute role set up.",
            ephemeral: true
        });

        if (member && member.roles.cache.has(muteRole.id)) await member.roles.remove(muteRole);

        const currentMute = await client.db.mutes.findActive(guild.id, member.id);
        if (!currentMute) await client.db.mutes.update(currentMute._id, { active: false });
        else return interaction.reply("<:no:811763209237037058> The specified member is not muted.");

        return interaction.reply(`<:check:811763193453477889> \`${member.user.tag}\` has been unmuted.`);
    }
}