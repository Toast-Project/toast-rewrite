import ToastClient from "../classes/ToastClient";
import { Message } from "discord.js";
import Command from "../classes/Command";

export default async function (client: ToastClient, message: Message, command: Command) {
    let permLevel = 0;

    const [mod, admin] = [message.guild.data?.roles?.mod, message.guild.data?.roles?.admin];
    const cmdLevel = command.conf.permLevel || 0;

    if (mod && message.member.roles.cache.get(mod)) permLevel = 1;
    if (admin && message.member.roles.cache.get(admin)) permLevel = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permLevel = 3;
    if (message.member.id === message.guild.ownerID) permLevel = 4;
    if (client.config.developers.includes(message.member.id)) permLevel = 5;

    return (permLevel >= cmdLevel) ? null : client.config.permissionLevels[cmdLevel] || cmdLevel;
}