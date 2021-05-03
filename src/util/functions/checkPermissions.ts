import ToastClient from "../classes/ToastClient";
import { Message } from "discord.js";
import Command from "../classes/Command";

export default async function (client: ToastClient, message: Message, command: Command) {
    let permLevel = 0;
    let response = null

    const [mod, admin] = [message.guild.data?.roles?.mod, message.guild.data?.roles?.admin];
    const commands = message.guild.data?.commands || {};

    const cmdLevel = commands[command.help.name].permissionLevel || command.conf.permissionLevel || 0;
    const cmdRole = commands[command.help.name].permissionLevel ? message.guild.roles.cache.get(getId(cmdLevel)) : null;

    if (mod && message.member.roles.cache.get(mod)) permLevel = 1;
    if (admin && message.member.roles.cache.get(admin)) permLevel = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permLevel = 3;
    if (message.member.id === message.guild.ownerID) permLevel = 4;
    if (client.config.developers.includes(message.member.id)) permLevel = 5;

    if (cmdRole) {
        if (message.member.roles.cache.get(cmdRole.id) || permLevel >= 3) {
            response = null
        } else {
            response = `"${cmdRole.name}" role or Administrator Permissions`
        }
    }

    return response;
}

function getId(str) {
    return ((str || "").match(/\d+/g) || [])[0];
}