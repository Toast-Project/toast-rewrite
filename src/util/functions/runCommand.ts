import ToastClient from "../classes/ToastClient";
import Command from "../classes/Command";
import { Message } from "discord.js";

export default async function runCommand(client: ToastClient, message: Message, args?: Array<string>) {
    let commandName = args.shift().toLowerCase();
    const command: Command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.conf.aliases && cmd.conf.aliases.includes(commandName));
    if (!command) return;

    message.command = command;
    await command.setMessage(message);
    await command.run(client, message, args);
};