import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, Snowflake } from "discord.js";

export default class extends SlashCommand {
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
        let [user] = interaction.options.map(v => v.value);

        const resolvedUser = await client.users.fetch(<Snowflake>user)
            .catch(e => {
                return interaction.reply("<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.", { ephemeral: true });
            });

        if (!resolvedUser) return interaction.reply("<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.", { ephemeral: true });

        const guild = interaction.guild;
        const member = guild.members.cache.get(<Snowflake>user);

        let muteRole = interaction.guild.data?.roles?.mute;

        muteRole = guild.roles.cache.get(muteRole);
        if (!muteRole) return interaction.reply("<:no:811763209237037058> This server does not have a mute role set up.", { ephemeral: true });

        const currentMute = await client.db.mutes.findActive(guild.id, member.id);
        if (!currentMute) await client.db.mutes.update(currentMute._id, { active: false });
        else return interaction.reply("<:no:811763209237037058> The specified member is not muted.");

        return interaction.reply(`<:check:811763193453477889> \`${member.user.tag}\` has been unmuted.`);
    }
}