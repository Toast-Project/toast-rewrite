import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, GuildMember } from "discord.js";
import embed from "../../util/functions/embed";
import ms = require("ms");

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "daily",
            description: "Collect your daily reward.",
            category: "social"
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const { economy = {} } = interaction.guild.data;
        const symbol = economy.symbol || "$";
        const member = <GuildMember>interaction.member;

        if (member) member.data = await client.db.members.get(interaction.guildId, member.user.id) || {};
        const {
            data: { worth = 0, lastDaily = 0 }
        } = member;

        const dailyReward = economy.dailyReward || 250;
        const timeout = 86_340_000;

        if (lastDaily + timeout > Date.now()) {
            const time = ms(lastDaily + timeout - Date.now(), { long: true });
            return interaction.reply({
                content: `You must wait ${time} before collecting your daily reward.`,
                ephemeral: true
            });
        }

        await client.db.members.setLastDaily(interaction.guildId, interaction.user.id, Date.now());
        await client.db.members.modBalance(interaction.guildId, interaction.user.id, dailyReward);
        await client.db.members.modWorth(interaction.guildId, interaction.user.id, dailyReward);

        const replyEmbed = embed({
            title: "Daily",
            color: "GREEN",
            author: [interaction.user.tag, interaction.user.displayAvatarURL()],
            description: `You have collected your daily reward of **${symbol}${dailyReward}**!\nYour new balance is **${symbol}${worth + dailyReward}**.`
        });

        return await interaction.reply({ embeds: [replyEmbed] });
    }
}