import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";
import embed from "../../util/functions/embed";
import { getLevel } from "../../util/functions/leveling";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "leaderboard",
            description: "View the level/economy leaderboard.",
            category: "social",
            options: [
                {
                    "type": 5,
                    "name": "economy",
                    "description": "View the economy leaderboard",
                    "required": false
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const economyLeaderboard = interaction.options[0]?.value;

        if (economyLeaderboard) {
            const { economy = {} } = interaction.guild.data;
            const symbol = economy.symbol || "$";

            const cursor = await client.db.members.cursorByGuild(interaction.guild.id);
            const top10 = await cursor
                .sort({ worth: -1 })
                .limit(10)
                .toArray();

            const lbEmbed = embed({
                title: "Economy Leaderboard",
                color: "BLUE"
            });

            let description = "";
            for (let i = 0; i < top10.length; i++) {
                let member;

                try {
                    member = await interaction.guild.members.fetch(top10[i]["user"]);
                } catch { continue }

                if (!member) continue;

                description += `**#${i + 1}**\n${member.user.tag} - ${symbol}\`${top10[i]["worth"] || 0}\`\n`;
            }

            lbEmbed.setDescription(description);

            return interaction.reply(lbEmbed);
        }

        const cursor = await client.db.members.cursorByGuild(interaction.guild.id);
        const top10 = await cursor
            .sort({ xp: -1 })
            .limit(10)
            .toArray();

        const lbEmbed = embed({
            title: "XP Leaderboard",
            color: "BLUE"
        });

        let description = "";
        for (let i = 0; i < top10.length; i++) {
            let member;

            try {
                member = await interaction.guild.members.fetch(top10[i]["user"]);
            } catch { continue }

            if (!member) continue;

            const level = getLevel(top10[i]["xp"] || 0);
            description += `**#${i + 1}**\n${member.user.tag} - \`${`Level ${level + 1}` || `Level 1`}\`\n`;
        }

        lbEmbed.setDescription(description);
        return interaction.reply(lbEmbed);
    }
}