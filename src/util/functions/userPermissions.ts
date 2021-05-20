import ToastClient from "../classes/ToastClient";
import { GuildMember } from "discord.js";

export default async function (client: ToastClient, interaction: any, member: GuildMember) {
    let permLevel = 0;

    const { guild } = interaction;

    const [mod, admin] = [guild.data?.roles?.mod, guild.data?.roles?.admin];

    if (mod && member.roles.cache.get(mod)) permLevel = 1;
    if (admin && member.roles.cache.get(admin)) permLevel = 2;
    if (member.permissions.has("ADMINISTRATOR")) permLevel = 3;
    if (member.user.id === guild.ownerID) permLevel = 4;
    if (client.config.developers.includes(member.user.id)) permLevel = 5;

    return permLevel;
}