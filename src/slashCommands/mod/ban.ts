import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import userPermissions from "../../util/functions/userPermissions";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "ban",
            description: "Ban a user from the server.",
            permissionLevel: 1,
            options: [
                {
                    "type": 6,
                    "name": "user",
                    "description": "User to ban",
                    "default": false,
                    "required": true
                },
                {
                    "type": 3,
                    "name": "reason",
                    "description": "Ban reason",
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

        const authorPermLevel = await userPermissions(client, interaction, author);
        const targetPermLevel = member ? await userPermissions(client, interaction, member) : 0;

        if (targetPermLevel >= authorPermLevel) {
            return this.post(client, interaction, {
                type: 4,
                data: {
                    flags: 1 << 6,
                    content: "<:no:811763209237037058> Your permission level must be higher than the specified user in order to ban them."
                }
            });
        }

        await guild.members.ban(user, { reason: reason || "No reason provided" })
            .catch(e => {
                return this.post(client, interaction, {
                    type: 4,
                    data: {
                        flags: 1 << 6,
                        content: `<:no:811763209237037058> The following error occurred while attempting to ban this member:\n\`\`\`${e}\`\`\``
                    }
                });
            });

        return this.post(client, interaction, {
            type: 4,
            data: {
                content: `<:check:811763193453477889> \`${user.tag}\` has been banned${reason ? ` for \`${reason}\`.` : "."}`
            }
        });
    }
}