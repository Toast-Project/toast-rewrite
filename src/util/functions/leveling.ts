import { Message } from "discord.js";
import ToastClient from "../classes/ToastClient";

const recents = new Map();

export async function addXP(client: ToastClient, message: Message) {
    const { guild, member } = message;
    const { xp } = member.data;

    const { leveling = false } = guild.data;
    if (!leveling) return;

    const currentLevel = getLevel(xp);

    const recent = recents.get(guild.id + "_" + member.id);
    if (!recent || recent + 30_000 < Date.now()) {
        recents.set(guild.id + "_" + member.id, Date.now());

        const { xpMultiplier = 1 } = guild.data;
        const newXP = xpMultiplier * rand(1, 5);

        await client.db.members.modXp(message.guild.id, message.author.id, newXP);

        const newLevel = getLevel(xp + newXP);
        if (newLevel > currentLevel) await levelUp(client, message, newLevel);
    }
}

async function levelUp(client: ToastClient, message: Message, newLevel: number) {
    await message.reply(`It's your lucky day, you just advanced to level ${newLevel}!`)
        .catch(() => null);
}

export function getLevel(xp: number) {
    return Math.floor(Math.sqrt(xp / 10));
}

export function getLevelProgress(xp: number) {
    return getProgression(xp) / getLevelXp(xp);
}

function getProgression(xp: number) {
    return xp - getXp(getLevel(xp));
}

function getXp(level: number) {
    return 10 * level ** 2;
}

function getLevelXp(xp: number) {
    return getXp(getLevel(xp) + 1) - getXp(getLevel(xp));
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}