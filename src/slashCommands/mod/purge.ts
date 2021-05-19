import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { TextChannel } from "discord.js";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "purge",
            description: "Bulk-delete the specified amount of messages.",
            permissionLevel: 1,
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

    public async run(client: ToastClient, interaction) {
        let [amount] = interaction.data.options.map(v => v.value);
        const channel  = await client.channels.cache.get(interaction.channel_id);

        if (!channel) {
            return this.post(client, interaction, {
                type: 4,
                data: {
                    flags: 1 << 6,
                    content: "<:no:811763209237037058> There was an error fetching the channel. Please report this to the Toast development team."
                }
            });
        }

        if (amount <= 1 || amount > 99) {
            return this.post(client, interaction, {
                type: 4,
                data: {
                    flags: 1 << 6,
                    content: "<:no:811763209237037058> You must delete an amount of messages between 2-99."
                }
            });
        }

        let messagesDeleted = null;
        if (((channel): channel is TextChannel => channel.type === "text")(channel)) {
            const { size: deleted } = await channel.bulkDelete(amount);
            messagesDeleted = deleted;
        }

        return this.post(client, interaction, {
            type: 4,
            data: {
                flags: 1 << 6,
                content: `<:check:811763193453477889> Cleared \`${messagesDeleted}\` messages.`
            }
        });
    }
}