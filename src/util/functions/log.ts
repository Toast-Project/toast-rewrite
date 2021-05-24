import ToastClient from "../classes/ToastClient";
import { Guild, MessageEmbed, TextChannel, User } from "discord.js";
import embed from "./embed";
import moment = require("moment");

export default async function log(client: ToastClient, guild: Guild, data: any) {
    const channel: TextChannel = await getLogChannel(guild);
    if (!channel) return;

    const log = buildEmbed(data.type, data);
    await channel.send(log)
        .catch(() => null);
}

async function getLogChannel(guild) {
    const guildData = guild.data?.channels?.log;
    if (!guildData) return;

    const logChannel: TextChannel = guild.channels.cache.get(guildData);
    if (!logChannel) return;

    return logChannel;
}

function buildEmbed(type, data) {
    switch (type) {
        case "messageDelete":
            return embed({
                title: "Message Deleted",
                description: `**User:** ${data.user.tag} ${data.user}\n**Channel:** ${data.channel}\n**Message:**\n${data.message.content}`
            });

        case "messageUpdate":
            return embed({
                title: "Message Edited",
                description: `**User:** ${data.user.tag} ${data.user}\n**Channel:** ${data.channel}\n**Before:**\n${data.oldMessage.content}\n**After:**\n${data.newMessage.content}`
            });

        case "guildMemberAdd":
            return embed({
                title: "Member Joined",
                description: `**User:** ${data.user.tag} ${data.user}`
            });

        case "guildMemberRemove":
            return embed({
                title: "Member Left",
                description: `**User:** ${data.user.tag} ${data.user}`
            });
    }
}

export async function notify(guild: Guild, user: User, type: "mute" | "warn" | "ban" | "kick", date: number, duration: any, reason: string) {
    let response: MessageEmbed;

    switch (type) {
        case "mute":
            response = embed({
                title: "New Moderation Action",
                color: "RED",
                description:
                    `Hi, ${user.username}.\n` +
                    `You have just received a moderation action in the \`${guild.name}\` server.\n\n` +
                    `**💬 Type of Action:** \`${type}\`\n` +
                    `**🕑 Time of Action:** \`${moment(date).format("llll")}\`\n` +
                    `**⏰ Time Remaining:** \`${duration}\`\n` +
                    `**📋 Reason/Proof:**\n \`\`\`${reason}\`\`\`\n\n` +
                    `**⚖️ Appeals**\n` +
                    `Feel this action was unfair? Feel free to appeal to a staff member or moderator from the server.`,
                timestamp: true
            });

            return user.send(response)
                .catch((e) => null);

        case "warn":
            response = embed({
                title: "New Moderation Action",
                color: "RED",
                description:
                    `Hi, ${user.username}.\n` +
                    `You have just received a moderation action in the \`${guild.name}\` server.\n\n` +
                    `**💬 Type of Action:** \`${type}\`\n` +
                    `**🕑 Time of Action:** \`${moment(date).format("llll")}\`\n` +
                    `**📋 Reason/Proof:**\n \`\`\`${reason}\`\`\`\n\n` +
                    `**⚖️ Appeals**\n` +
                    `Feel this action was unfair? Feel free to appeal to a staff member or moderator from the server.`,
                timestamp: true
            });

            return user.send(response)
                .catch((e) => null);

        case "kick":
            response = embed({
                title: "New Moderation Action",
                color: "RED",
                description:
                    `Hi, ${user.username}.\n` +
                    `You have just received a moderation action in the \`${guild.name}\` server.\n\n` +
                    `**💬 Type of Action:** \`${type}\`\n` +
                    `**🕑 Time of Action:** \`${moment(date).format("llll")}\`\n` +
                    `**📋 Reason/Proof:**\n \`\`\`${reason}\`\`\`\n\n` +
                    `**⚖️ Appeals**\n` +
                    `Feel this action was unfair? Feel free to appeal to a staff member or moderator from the server.`,
                timestamp: true
            });

            return user.send(response)
                .catch((e) => null);

        case "ban":
            response = embed({
                title: "New Moderation Action",
                color: "RED",
                description:
                    `Hi, ${user.username}.\n` +
                    `You have just received a moderation action in the \`${guild.name}\` server.\n\n` +
                    `**💬 Type of Action:** \`${type}\`\n` +
                    `**🕑 Time of Action:** \`${moment(date).format("llll")}\`\n` +
                    `**📋 Reason/Proof:**\n \`\`\`${reason}\`\`\`\n\n` +
                    `**⚖️ Appeals**\n` +
                    `Feel this action was unfair? Feel free to appeal to a staff member or moderator from the server.`,
                timestamp: true
            });

            return user.send(response)
                .catch((e) => null);
    }
}