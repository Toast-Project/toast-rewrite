import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, TextChannel } from "discord.js";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "purge",
            description: "Bulk-delete the specified amount of messages.",
            permissionLevel: 1,
            category: "mod",
            options: [
                {
                    "type": 4,
                    "name": "amount",
                    "description": "Amount of messages to delete",
                    "default": false,
                    "required": true
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let [amount] = interaction.options.map(v => v.value);
        const channel = interaction.channel;

        if (!channel) {
            return interaction.reply("<:no:811763209237037058> There was an error fetching the channel. Please report this to the Toast development team.", { ephemeral: true });
        }

        if (amount <= 1 || amount > 99) {
            return interaction.reply("<:no:811763209237037058> You must delete an amount of messages between 2-99.", { ephemeral: true });
        }

        let messagesDeleted = null;
        if (((channel): channel is TextChannel => channel.type === "text")(channel)) {
            const { size: deleted } = typeof (amount) === "number" ? await channel.bulkDelete(amount) : null;
            messagesDeleted = deleted;
        }

        return interaction.reply(`<:check:811763193453477889> Cleared \`${messagesDeleted}\` messages.`, { ephemeral: true })
    }
}