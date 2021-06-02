import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, Snowflake, TextChannel } from "discord.js";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "buy",
            description: "Buy an item from the item shop.",
            category: "social",
            options: [
                {
                    "type": 3,
                    "name": "item",
                    "description": "Name or ID of item",
                    "required": true
                },
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const itemName = interaction.options[0].value;

        const { economy = {} } = interaction.guild.data;
        const member = interaction.guild.members.cache.get(<Snowflake>interaction.user.id);

        const symbol = economy.symbol || "$";
        const { balance = 0, inventory = [] } = member.data;

        let items = await client.db.guildShop.find({ guild: interaction.guild.id, _id: itemName });
        if (!items.length) items = await client.db.guildShop.find({ guild: interaction.guild.id, name: { "$regex": itemName, $options: "i" } });
        if (!items.length) return interaction.reply("There are no items with the specified name or ID.", { ephemeral: true });

        const { _id, name, cost, role, limit, uses } = items[0];

        await interaction.reply(`Are you sure you would like to purchase the item: **${name}** for: **${symbol}${cost}**? (reply \`yes\` to continue)`);

        const channel = <TextChannel>interaction.channel;
        const messages = await channel.awaitMessages(
            msg => msg.author.id === interaction.user.id,
            { max: 1, time: 60_000, errors: ["time"] }
        );

        const content = messages.first().content;
        if (!content.toLowerCase().startsWith("y")) return interaction.editReply("Purchase cancelled.");

        if (inventory.includes(_id)) return interaction.editReply("<:no:811763209237037058> You already own this item.");
        if (limit >= 1 && uses >= limit) return interaction.editReply("<:no:811763209237037058> This item is limited and currently sold out.");
        if (cost > balance) return interaction.editReply("<:no:811763209237037058> You cannot afford this item.");

        if (role) {
            const newRole = interaction.guild.roles.cache.get(role);
            if (newRole) {
                await member.roles.add(newRole)
                    .catch(e => {
                        return interaction.editReply("<:no:811763209237037058> An error occurred while trying to give you the role associated with this item.");
                    });
            }
        }

        await client.db.members.modWorth(interaction.guild.id, interaction.user.id, -cost);
        await client.db.members.modBalance(interaction.guild.id, interaction.user.id, -cost);
        await client.db.members.addItem(interaction.guild.id, interaction.user.id, _id);
        await client.db.guildShop.addUses(_id, 1);

        return interaction.editReply(`Congrats, you have successfully purchased the **${name}** item for **${symbol}${cost}**!`);
    }
}