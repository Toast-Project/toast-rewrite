import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import userPermissions from "../../util/functions/userPermissions";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "kick",
            description: "Kick a user from the server.",
            permissionLevel: 1,
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

    public async run(client: ToastClient, interaction) {
        let [user, reason] = interaction.data.options.map(v => v.value);
        user = await client.users.fetch(user)
            .catch(e => {
                return this.post(client, interaction, {
                    type: 4,
                    data: {
                        flags: 1 << 6,
                        content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team."
                    }
                });
            });

        const guild = await client.guilds.cache.get(interaction.guild_id);
        const member = guild.member(user);
        const author = guild.member(interaction.member.user.id);

        if (!member) {
            return this.post(client, interaction, {
                type: 4,
                data: {
                    flags: 1 << 6,
                    content: "<:no:811763209237037058> The user provided is not in the server."
                }
            });
        }

        const authorPermLevel = await userPermissions(client, interaction, author);
        const targetPermLevel = await userPermissions(client, interaction, member);

        if (targetPermLevel >= authorPermLevel) {
            return this.post(client, interaction, {
                type: 4,
                data: {
                    flags: 1 << 6,
                    content: "<:no:811763209237037058> Your permission level must be higher than the specified user in order to kick them."
                }
            });
        }

        await member.kick(reason || "No reason provided")
            .catch(e => {
                return this.post(client, interaction, {
                    type: 4,
                    data: {
                        flags: 1 << 6,
                        content: `<:no:811763209237037058> The following error occurred while attempting to kick this member:\n\`\`\`${e}\`\`\``
                    }
                });
            });

        return this.post(client, interaction, {
            type: 4,
            data: {
                content: `<:check:811763193453477889> \`${user.tag}\` has been kicked${reason ? ` for \`${reason}\`.` : "."}`
            }
        });
    }
}