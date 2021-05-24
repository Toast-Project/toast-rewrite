import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";
import * as fs from "fs";
import embed from "../../util/functions/embed";
import ms = require("ms");
import { resolve } from "path";

const dir = resolve(__dirname, "..", "..", "..", "src/util/assets/responses/work.txt");
const responses = fs.readFileSync(dir).toString()
    .split(/\r?\n/g)
    .filter(Boolean);

export default class extends SlashCommand {
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

        const { balance = 0, lastWork = 0 } = client.db.members.get(interaction.guildID, interaction.user.id);
        const timeout = economy.workCooldown || 1_800_000;

        if (lastWork + timeout > Date.now()) {
            const time = ms(lastWork + timeout - Date.now(), { long: true });
            return interaction.reply(`You must wait ${time} before going back to work.`, { ephemeral: true });
        }

        const amount = rand(25, 100);
        const response = responses[Math.floor(Math.random() * responses.length)];

        await client.db.members.setLastWork(interaction.guildID, interaction.user.id, Date.now());
        await client.db.members.modBalance(interaction.guildID, interaction.user.id, amount);
        await client.db.members.modWorth(interaction.guildID, interaction.user.id, amount);

        const replyEmbed = embed({
            title: "Work",
            color: "GREEN",
            author: [interaction.user.tag, interaction.user.displayAvatarURL()],
            description: `${response.replace(/{}/g, `**${symbol}${amount}**`)}\nYour new balance is **${symbol}${balance + amount}**.`
        });

        return await interaction.reply(replyEmbed);
    }
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() + (max - min + 1)) + min;
}