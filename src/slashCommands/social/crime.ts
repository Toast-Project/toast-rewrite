import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, GuildMember } from "discord.js";
import * as fs from "fs";
import embed from "../../util/functions/embed";
import { resolve } from "path";
import ms = require("ms");

const pDir = resolve(__dirname, "..", "..", "..", "src/util/assets/responses/pCrime.txt");
const nDir = resolve(__dirname, "..", "..", "..", "src/util/assets/responses/nCrime.txt");

const pResponses = fs.readFileSync(pDir).toString()
    .split(/\r?\n/g)
    .filter(Boolean);

const nResponses = fs.readFileSync(nDir).toString()
    .split(/\r?\n/g)
    .filter(Boolean);

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "crime",
            description: "Commit a crime.",
            category: "social"
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const { economy = {} } = interaction.guild.data;
        const symbol = economy.symbol || "$";
        const member = <GuildMember>interaction.member;

        if (member && member) member.data = await client.db.members.get(interaction.guildID, member.user.id) || {};
        const {
            data: { worth = 0, lastCrime = 0 }
        } = member;

        const timeout = economy.crimeCooldown || 1_800_000;

        if (lastCrime + timeout > Date.now()) {
            const time = ms(lastCrime + timeout - Date.now(), { long: true });
            return interaction.reply(`You must wait ${time} before committing another crime.`, { ephemeral: true });
        }

        const result = rand(0, 2) > 0;
        const amount = result ? rand(25, 100) : rand(-120, -5);

        const response = result
            ? pResponses[Math.floor(Math.random() * pResponses.length)]
            : nResponses[Math.floor(Math.random() * nResponses.length)];

        await client.db.members.setLastCrime(interaction.guildID, interaction.user.id, Date.now());
        await client.db.members.modBalance(interaction.guildID, interaction.user.id, amount);
        await client.db.members.modWorth(interaction.guildID, interaction.user.id, amount);

        const replyEmbed = embed({
            title: "Work",
            color: result ? "GREEN" : "RED",
            author: [interaction.user.tag, interaction.user.displayAvatarURL()],
            description: `${response.replace(/{}/g, `**${symbol}${amount}**`)}\nYour new balance is **${symbol}${worth + amount}**.`
        });

        return await interaction.reply(replyEmbed);
    }
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}