import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "addmoney",
            description: "Add/remove money from another member.",
            category: "social",
            permissionLevel: 2,
            options: [
                {
                    "type": 6,
                    "name": "user",
                    "description": "User to pay",
                    "default": false,
                    "required": true
                },
                {
                    "type": 4,
                    "name": "amount",
                    "description": "Amount to pay",
                    "default": false,
                    "required": true
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let user = interaction.options.getUser("user");
        let amount = interaction.options.getInteger("amount");

        const resolvedMember = await interaction.guild.members.fetch(user.id)
            .catch(e => {
                return interaction.reply({
                    content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.",
                    ephemeral: true
                });
            });

        if (!resolvedMember) return interaction.reply({
            content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.",
            ephemeral: true
        });
        if (resolvedMember.user.bot) return interaction.reply({
            content: "<:no:811763209237037058> You cannot pay a bot.",
            ephemeral: true
        });

        const { economy = {} } = interaction.guild.data;
        const symbol = economy.symbol || "$";

        if (amount < 1) return interaction.reply({
            content: `You cannot pay an amount less than ${symbol}1!`,
            ephemeral: true
        });

        await client.db.members.modWorth(interaction.guild.id, interaction.user.id, -amount);
        await client.db.members.modBalance(interaction.guild.id, interaction.user.id, -amount);

        return interaction.reply(`**${symbol}${amount}** has successfully been added to ${resolvedMember}'s balance.`);
    }
}