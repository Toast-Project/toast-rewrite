import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import userPermissions from "../../util/functions/userPermissions";
import { CommandInteraction, GuildMember } from "discord.js";
import { notify } from "../../util/functions/log";
import ms = require("ms");

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "mute",
            description: "Mute a member in the server.",
            permissionLevel: 1,
            category: "mod",
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

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let user = interaction.options.getUser("user");
        let duration: any = interaction.options.getString("duration");
        let reason = interaction.options.getString("reason");

        duration = ms(duration.toString());

        if (!duration) return interaction.reply({
            content: "<:no:811763209237037058> You must provide a valid duration (eg. 10m or 8h).",
            ephemeral: true
        })

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
                content: "<:no:811763209237037058> Your permission level must be higher than the specified user in order to mute them.",
                ephemeral: true
            });
        }

        let muteRole = interaction.guild.data?.roles?.mute;

        muteRole = guild.roles.cache.get(muteRole);
        if (!muteRole) {
            try {
                const role = await guild.roles.create({
                    name: "Muted",
                    reason: "Feel free to change the name of this role"
                });

                for (const channel of guild.channels.cache.values()) {
                    if (channel.type === "GUILD_VOICE") {
                        await channel.permissionOverwrites.create(role, { SPEAK: false });
                    } else if (channel.type === "GUILD_TEXT") {
                        await channel.permissionOverwrites.create(role, { SEND_MESSAGES: false, ADD_REACTIONS: false });
                    } else if (channel.type === "GUILD_CATEGORY") {
                        await channel.permissionOverwrites.create(role, {
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false,
                            SPEAK: false
                        });
                    }
                }

                muteRole = role;
                await client.db.guilds.setMuteRole(guild.id, role.id);
            } catch (err) {
                return interaction.reply({
                    content: `<:no:811763209237037058> I am missing permission to create roles or manage channels. Please give me these permissions, or create a Muted role and use the setmuterole command to configure it.`,
                    ephemeral: true
                });
            }
        }

        const currentMute = await client.db.mutes.findActive(guild.id, member.id);
        if (currentMute) {
            await client.db.mutes.update(currentMute._id, { active: false });
        }

        await member.roles.add(muteRole)
            .catch(e => {
                return interaction.reply({
                    content: `<:no:811763209237037058> I am unable to mute the specified member. Make sure my role and the muted role is higher than the specified member.\n\nError: \`${e}\``,
                    ephemeral: true
                });
            });

        const mute = {
            _id: client.randomId(),
            guild: guild.id,
            mod: author.user.id,
            user: member.user.id,
            createdAt: Date.now(),
            active: true,
            duration,
            reason
        };

        await client.db.mutes.insert(mute)
            .catch(e => {
                return interaction.reply({
                    content: `<:no:811763209237037058> An unexpected error occurred. Please report this to the Toast development team.\n\nError: \`${e}\``,
                    ephemeral: true
                })
            });

        await notify(interaction.guild, user, "mute", Date.now(), ms(duration, { long: true }), <string>reason || "No reason provided.")
            .catch(e => e);

        return interaction.reply(`<:check:811763193453477889> \`${member.user.tag}\` has been muted for \`${ms(duration, { long: true })}\`.`);
    }
}