import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, GuildMember, User } from "discord.js";
import embed from "../../util/functions/embed";
import ms = require("ms");

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "rob",
            description: "Rob another server member.",
            category: "social",
            options: [
                {
                    "type": 6,
                    "name": "member",
                    "description": "Member",
                    "required": true
                },
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        const { economy = {} } = interaction.guild.data;
        const symbol = economy.symbol || "$";
        const member = <GuildMember>interaction.member;

        let user: User = interaction.options.getUser("user", true);
        const resolvedUser = await interaction.guild.members.fetch(user.id)
            .catch(e => {
                return interaction.reply({
                    content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.",
                    ephemeral: true
                });
            });

        if (!resolvedUser) return interaction.reply({
            content: "<:no:811763209237037058> An error occurred while trying to fetch the user. Please report this to the Toast development team.",
            ephemeral: true
        });

        if (member) member.data = await client.db.members.get(interaction.guildId, member.user.id) || {};
        const {
            data: { worth = 0, lastRob = 0, robbedBy = null }
        } = member;

        const timeout = economy.robCooldown || 14_400_000;

        if (lastRob + timeout > Date.now()) {
            const time = ms(lastRob + timeout - Date.now(), { long: true });
            return interaction.reply({
                content: `You must wait ${time} before attempting to rob someone.`,
                ephemeral: true
            });
        }

        let response;
        let result = true;
        let finalResult = 0;
        finalResult += rand(1, 4);
        if (finalResult > 2) finalResult = rand(1, 4);

        finalResult += 2;
        if (finalResult >= 4) result = null;

        const memberData = await client.db.members.get(interaction.guild.id, resolvedUser.id) || {};
        if (!memberData?.balance || memberData.balance < 50) {
            return interaction.reply({ content: "The user you are attempting to rob is too poor.", ephemeral: true });
        }

        await client.db.members.setLastRob(interaction.guild.id, interaction.user.id, Date.now());

        if (result) {
            const amount = Math.floor(memberData.balance / 18);
            await client.db.members.modWorth(interaction.guild.id, interaction.user.id, amount);
            await client.db.members.modWorth(interaction.guild.id, resolvedUser.id, -amount);
            await client.db.members.modBalance(interaction.guild.id, interaction.user.id, amount);
            await client.db.members.modBalance(interaction.guild.id, resolvedUser.id, -amount);
            await client.db.members.setRobbedBy(interaction.guild.id, resolvedUser.id, interaction.user.id);

            if (robbedBy && robbedBy === member.id) {
                response = embed({
                    title: "Rob",
                    color: "GREEN",
                    author: [interaction.user.tag, interaction.user.displayAvatarURL()],
                    description: `**PAYBACK ROB!** You successful robbed **${resolvedUser.user.tag}** and gained **${symbol}${amount}**.\nYour new balance is **${symbol}${worth + amount}**.`
                });
                await client.db.members.setRobbedBy(interaction.guild.id, resolvedUser.id, interaction.user.id);
            } else {
                response = embed({
                    title: "Rob",
                    color: "GREEN",
                    author: [interaction.user.tag, interaction.user.displayAvatarURL()],
                    description: `You successful robbed **${resolvedUser.user.tag}** and gained **${symbol}${amount}**.\nYour new balance is **${symbol}${worth + amount}**.`
                });
            }
        } else {
            const amount = Math.floor(-rand(20, 190));
            await client.db.members.modBalance(interaction.guild.id, interaction.user.id, amount);
            await client.db.members.modWorth(interaction.guild.id, interaction.user.id, amount);

            response = embed({
                title: "Rob",
                color: "RED",
                author: [interaction.user.tag, interaction.user.displayAvatarURL()],
                description: `You were caught robbing **${resolvedUser.user.tag}** and got fined **${symbol}${amount}**.\nYour new balance is **${symbol}${worth + amount}**.`
            });
        }

        return interaction.reply(response);
    }
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}