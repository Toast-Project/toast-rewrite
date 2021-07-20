import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, TextChannel } from "discord.js";
import embed from "../../util/functions/embed";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "addnote",
            description: "Add a note to a suggestion",
            permissionLevel: 1,
            category: "suggestions",
            options: [
                {
                    "type": 3,
                    "name": "id",
                    "description": "Suggestion ID",
                    "required": true
                },
                {
                    "type": 3,
                    "name": "note",
                    "description": "Note content",
                    "required": true
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        if (!interaction.guild.data?.modules?.suggestions) return interaction.reply({
            content: "<:no:811763209237037058> The suggestions module is currently disabled.",
            ephemeral: true
        });

        const id = interaction.options.getString("id");
        const note = interaction.options.getString("note");

        const { suggestion } = interaction.guild.data?.channels || {};
        const suggestionChannel = suggestion ? interaction.guild.channels.cache.get(suggestion) : null;
        if (!suggestionChannel || !(suggestionChannel instanceof TextChannel)) return interaction.reply({
            content: "<:no:811763209237037058> This server does not have a suggestion channel set up yet.",
            ephemeral: true
        });

        let suggest = await client.db.suggestions.find({
            guild: interaction.guild.id,
            _id: { "$regex": id, $options: "i" }
        });
        if (!suggest || suggest.length < 1) return interaction.reply({
            content: "The provided suggestion ID does not exist.",
            ephemeral: true
        });

        suggest = suggest[0];
        await client.db.suggestions.note(interaction.guild.id, suggest["_id"], note);

        const suggestionMessage = await suggestionChannel.messages.fetch(suggest["messageId"])
            .catch(e => {
                return interaction.reply({
                    content: "<:no:811763209237037058> The suggestion message cannot be located. Maybe it was deleted?",
                    ephemeral: true
                });
            });
        if (!suggestionMessage) return interaction.reply({
            content: "<:no:811763209237037058> An unexpected error occurred while attempting to find the message.",
            ephemeral: true
        });

        const user = await client.users.cache.get(suggest.user);
        const newEmbed = embed({
            title: "Suggestion",
            color: "BLUE",
            author: [user.tag, user.displayAvatarURL()],
            description: suggest.text,
            fields: [
                [`Note from ${interaction.user.tag}`, note]
            ],
            footer: [`ID: ${suggest._id}`]
        });

        const msg = await suggestionMessage.edit({ embeds: [newEmbed] })
            .catch(e => {
                return interaction.reply({
                    content: `<:no:811763209237037058> An unexpected error has occurred while attempting to update the suggestion:\n\n\`${e}\``,
                    ephemeral: true
                });
            });

        if (!msg) return interaction.reply({
            content: "<:no:811763209237037058> An unexpected error occurred while attempting to update the message.",
            ephemeral: true
        });
        await client.db.suggestions.updateMessage(interaction.guild.id, suggest._id, msg.id);

        return interaction.reply("<:check:811763193453477889> Your note has successfully been added to the suggestion.");
    }
}