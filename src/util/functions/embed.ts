import { ColorResolvable, Message, MessageEmbed, TextChannel, User } from "discord.js";

interface EmbedConf {
    title?: string,
    description?: string,
    thumbnail?: string,
    color?: ColorResolvable,
    footer?: Array<any>,
    timestamp?: boolean,
    author?: Array<any>,
    fields?: any
}

type EmbedOptions = EmbedConf;

export default function embed(obj: any, data: EmbedOptions) {
    const embed = new MessageEmbed();

    data.title ? embed.setTitle(data.title) : null;
    data.description ? embed.setDescription(data.description) : null;
    data.thumbnail ? embed.setThumbnail(data.thumbnail) : null;
    data.color ? embed.setColor(data.color) : embed.setColor("BLUE");
    data.footer ? embed.setFooter(data.footer) : embed.setFooter("Toast");
    data.timestamp ? embed.setTimestamp() : null;
    data.author ? embed.setAuthor(data.author[0], data.author[1]) : null;

    if (data.fields) {
        for (const fieldData in data.fields) {
            embed.addField(data.fields[fieldData][0], data.fields[fieldData][1]);
        }
    }

    if (obj instanceof TextChannel || obj instanceof User) {
        return obj.send(embed);
    }
    if (obj instanceof Message) {
        return obj.edit(embed);
    }
    return embed;
}