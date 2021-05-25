import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, GuildMember } from "discord.js";
import embed from "../../util/functions/embed";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "gamble",
            description: "Gamble your money.",
            category: "social",
            options: [
                {
                    "type": 4,
                    "name": "amount",
                    "description": "Amount of money to gamble",
                    "required": true
                },
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const amount = <number>interaction.options[0].value;

        const { economy = {} } = interaction.guild.data;
        const symbol = economy.symbol || "$";
        const member = <GuildMember>interaction.member;

        if (member) member.data = await client.db.members.get(interaction.guildID, member.user.id) || {};
        const {
            data: { worth = 0, balance = 0 }
        } = member;

        if (amount < 1) return interaction.reply(`You cannot gamble an amount less than ${symbol}1!`, { ephemeral: true });
        if (amount > balance) return interaction.reply("You cannot gamble more money than you have in your balance!", { ephemeral: true });

        const result = Math.random() < 1/3;
        const winnings = result ? amount * 2 : -amount;

        await client.db.members.modWorth(interaction.guild.id, interaction.user.id, winnings);
        await client.db.members.modBalance(interaction.guild.id, interaction.user.id, winnings);

        const replyEmbed = embed({
            title: "Gamble",
            color: result ? "GREEN" : "RED",
            author: [interaction.user.tag, interaction.user.displayAvatarURL()],
            description: `You gambled and ${result ? `doubled your bet of **${symbol}${amount}**!` : `it didn't pay off. You lost your bet of **${symbol}${amount}**.`}\nYour new balance is **${symbol}${worth + winnings}**.`
        });

        return await interaction.reply(replyEmbed);
    }
}