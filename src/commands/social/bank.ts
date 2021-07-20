import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, GuildMember } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "bank",
            description: "Deposit or withdraw money to/from the bank.",
            category: "social",
            options: [
                {
                    "type": 1,
                    "name": "deposit",
                    "description": "Deposit money",
                    "options": [
                        {
                            "type": 4,
                            "name": "amount",
                            "description": "Amount of money",
                            "default": false,
                            "required": true
                        }
                    ]
                },
                {
                    "type": 1,
                    "name": "withdraw",
                    "description": "Withdraw money",
                    "options": [
                        {
                            "type": 4,
                            "name": "amount",
                            "description": "Amount of money",
                            "default": false,
                            "required": true
                        }
                    ]
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let subCommand = interaction.options.getSubCommand();
        let amount = interaction.options.getInteger("amount");

        const { economy = {} } = interaction.guild.data;
        const symbol = economy.symbol || "$";

        const member = <GuildMember>interaction.member;
        const { balance = 0, bank = 0 } = member.data || {};

        switch (subCommand) {
            case "deposit":
                if (amount < 1 || balance < 1) return interaction.reply({
                    content: `You must provide an amount larger than ${symbol}1, and you must have at least ${symbol}1 in your balance.`,
                    ephemeral: true
                });
                if (amount > balance) amount = balance;

                await client.db.members.modBalance(interaction.guild.id, interaction.user.id, -amount);
                await client.db.members.modBank(interaction.guild.id, interaction.user.id, amount);

                return interaction.reply(`<:check:811763193453477889> **${symbol}${amount}** has successfully been deposited into your bank account.`);

            case "withdraw":
                if (amount < 1 || bank < 1) return interaction.reply({
                    content: `You must provide an amount larger than ${symbol}1, and you must have at least ${symbol}1 in your bank account.`,
                    ephemeral: true
                });
                if (amount > bank) amount = bank;

                await client.db.members.modBank(interaction.guild.id, interaction.user.id, -amount);
                await client.db.members.modBalance(interaction.guild.id, interaction.user.id, amount);

                return interaction.reply(`<:check:811763193453477889> **${symbol}${amount}** has successfully been moved to your balance.`);
        }
    }
}