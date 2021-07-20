import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, GuildMember } from "discord.js";
import * as fs from "fs";
import embed from "../../util/functions/embed";
import { resolve } from "path";
import ms = require("ms");

const dir = resolve(__dirname, "..", "..", "..", "src/util/assets/responses/work.txt");
const responses = fs.readFileSync(dir).toString()
    .split(/\r?\n/g)
    .filter(Boolean);

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "work",
            description: "Collect your wages.",
            category: "social"
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const { economy = {} } = interaction.guild.data;
        const symbol = economy.symbol || "$";
        const member = <GuildMember>interaction.member;

        if (member) member.data = await client.db.members.get(interaction.guildId, member.user.id) || {};
        const {
            data: { worth = 0, lastWork = 0 }
        } = member;

        const timeout = economy.workCooldown || 1_800_000;

        if (lastWork + timeout > Date.now()) {
            const time = ms(lastWork + timeout - Date.now(), { long: true });
            return interaction.reply({ content: `You must wait ${time} before going back to work.`, ephemeral: true });
        }

        const amount = rand(25, 100);
        const response = responses[Math.floor(Math.random() * responses.length)];

        await client.db.members.setLastWork(interaction.guildId, interaction.user.id, Date.now());
        await client.db.members.modBalance(interaction.guildId, interaction.user.id, amount);
        await client.db.members.modWorth(interaction.guildId, interaction.user.id, amount);

        const replyEmbed = embed({
            title: "Work",
            color: "GREEN",
            author: [interaction.user.tag, interaction.user.displayAvatarURL()],
            description: `${response.replace(/{}/g, `**${symbol}${amount}**`)}\nYour new balance is **${symbol}${worth + amount}**.`
        });

        return await interaction.reply({ embeds: [replyEmbed] });
    }
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}