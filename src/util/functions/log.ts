import ToastClient from "../classes/ToastClient";
import { Guild, TextChannel } from "discord.js";
import embed from "./embed";

export default async function (client: ToastClient, guild: Guild, data: any) {
    const channel: TextChannel = await getLogChannel(guild);
    if (!channel) return;

    const log = buildEmbed(data.type, data);
    return await channel.send(log)
        .catch(null);
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