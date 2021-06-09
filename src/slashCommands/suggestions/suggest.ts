import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, TextChannel } from "discord.js";
import embed from "../../util/functions/embed";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "suggest",
            description: "Create a suggestion",
            category: "suggestions",
            options: [
                {
                    "type": 3,
                    "name": "suggestion",
                    "description": "Suggestion content",
                    "required": true
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        if (!interaction.guild.data?.modules?.suggestions) return interaction.reply("<:no:811763209237037058> The suggestions module is currently disabled.", { ephemeral: true });

        const text = <string>interaction.options[0].value;
        const { suggestion } = interaction.guild.data?.channels || {};
        const suggestionChannel = suggestion ? interaction.guild.channels.cache.get(suggestion) : null;

        if (!suggestionChannel || !(suggestionChannel instanceof TextChannel)) return interaction.reply("<:no:811763209237037058> This server does not have a suggestion channel set up yet.", { ephemeral: true });

        const id = client.randomId();
        const suggestionEmbed = embed({
            title: "Suggestion",
            color: "BLUE",
            author: [interaction.user.tag, interaction.user.displayAvatarURL()],
            description: text,
            footer: [`ID: ${id}`]
        });

        const suggestionMessage = await suggestionChannel.send(suggestionEmbed)
            .catch(e => {
                return interaction.reply(`<:no:811763209237037058> The following error occurred while attempting to send this suggestion:\n\`\`\`${e}\`\`\``, { ephemeral: true });
            });
        if (!suggestionMessage) return;

        await suggestionMessage.react("👍")
            .catch(e => {});
        await suggestionMessage.react("👎")
            .catch(e => {});

        const newSuggestion = {
            _id: id,
            guild: interaction.guild.id,
            user: interaction.user.id,
            createdAt: Date.now(),
            status: "active",
            text,
            messageId: suggestionMessage.id
        };

        await client.db.suggestions.insert(newSuggestion)
            .catch(e => {
                return interaction.reply(`<:no:811763209237037058> The following error occurred while attempting to save this suggestion:\n\`\`\`${e}\`\`\``, { ephemeral: true });
            });

        return interaction.reply("<:check:811763193453477889> Your suggestion has been submitted successfully.");
    }
}