import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import userPermissions from "../../util/functions/userPermissions";
import ms = require("ms");

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "mute",
            description: "Mute a member in the server.",
            permissionLevel: 1,
            options: [
                {
                    "type": 6,
                    "name": "user",
                    "description": "User to mute",
                    "default": false,
                    "required": true
                },
                {
                    "type": 3,
                    "name": "duration",
                    "description": "Duration of mute",
                    "default": false,
                    "required": true
                },
                {
                    "type": 3,
                    "name": "reason",
                    "description": "Reason for mute",
                    "default": false,
                    "required": false
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction) {
        let [user, duration, reason] = interaction.data.options.map(v => v.value);
        duration = ms(duration);

        if (!duration) return this.post(client, interaction, {
            type: 4,
            data: {
                flags: 1 << 6,
                content: "<:no:811763209237037058> You must provide a valid duration (eg. 10m or 8h)."
            }
        });

        const guild = await client.guilds.cache.get(interaction.guild_id);
        const member = guild.member(user);
        const author = guild.member(interaction.member.user.id);
        const { roles } = guild.data;

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
                    content: "<:no:811763209237037058> Your permission level must be higher than the specified user in order to mute them."
                }
            });
        }

        let muteRole = guild.roles.cache.get(roles.mute);
        if (!muteRole) {
            try {
                const role = await guild.roles.create({
                    data: {
                        name: "Muted"
                    },
                    reason: "Feel free to change the name of this role"
                });

                for (const channel of guild.channels.cache.values()) {
                    if (channel.type === "voice") {
                        await channel.updateOverwrite(role, { SPEAK: false });
                    } else if (channel.type === "text") {
                        await channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false });
                    } else if (channel.type === "category") {
                        await channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false, SPEAK: false });
                    }
                }

                muteRole = role;
                await client.db.guilds.setMuteRole(guild.id, muteRole.id);
            } catch (err) {
                return this.post(client, interaction, {
                    type: 4,
                    data: {
                        flags: 1 << 6,
                        content: `<:no:811763209237037058> I am missing permission to create roles or manage channels. Please give me these permissions, or create a Muted role and use the setmuterole command to configure it.`
                    }
                });
            }
        }

        const currentMute = await client.db.mutes.findActive(guild.id, member.id);
        if (currentMute) {
            await client.db.mutes.update(currentMute._id, { active: false });
        }

        await member.roles.add(muteRole)
            .catch(e => {
                return this.post(client, interaction, {
                    type: 4,
                    data: {
                        flags: 1 << 6,
                        content: `<:no:811763209237037058> I am unable to mute the specified member. Make sure my role and the muted role is higher than the specified member.\n\nError: \`${e}\``
                    }
                });
            });

        const mute = {
            _id: client.randomId(),
            guild: guild.id,
            mod: author.id,
            user: user.id,
            createdAt: Date.now(),
            active: true,
            role: muteRole.id,
            duration,
            fullDuration: ms(duration, { long: true }),
            reason
        };

        await client.db.mutes.insert(mute)
            .catch(e => {
                return this.post(client, interaction, {
                    type: 4,
                    data: {
                        flags: 1 << 6,
                        content: `<:no:811763209237037058> An unexpected error occurred. Please report this to the Toast development team.\n\nError: \`${e}\``
                    }
                });
            });

        return this.post(client, interaction, {
            type: 4,
            data: {
                content: `<:check:811763193453477889> \`${member.user.tag}\` has been muted for \`${ms(duration, { long: true })}\`.`
            }
        });
    }
}