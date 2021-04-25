const { MessageEmbed } = require("discord.js");

class Embed {
    constructor(data = {}) {
        this.setup(data);
    }

    setup(data) {
        const embed = new MessageEmbed()
            .setColor(data.color || "BLUE")
            .setFooter(data.footer || "Toast");

        data.title ? embed.setTitle(data.title) : null;
        data.description ? embed.setDescription(data.description) : null;
        data.thumbnail ? embed.setThumbnail(data.thumbnail) : null;
        data.color ? embed.setColor(data.color) : null;
        data.footer ? embed.setFooter(data.footer) : null;
        data.timestamp ? embed.setTimestamp(data.timestamp) : null;
        data.author ? embed.setAuthor(data.author) : null;

        if (data.fields) {
            for (const fieldData in data.fields) {
                embed.addField(data.fields[fieldData][0], data.fields[fieldData][1]);
            }
        }

        return embed;
    }
}

module.exports = Embed;