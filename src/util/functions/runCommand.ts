import ToastClient from "../classes/ToastClient";
import validateArgs from "../functions/validateArgs";
import Command from "../classes/Command";
import { Message } from "discord.js";
import embed from "./embed";

export default async function runCommand(client: ToastClient, message: Message, _args?: Array<any>) {
    let commandName = _args.shift().toLowerCase();
    const command: Command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.conf.aliases && cmd.conf.aliases.includes(commandName));
    if (!command) return;

    let args = _args;
    if (command.conf.separator) args = _args.join(" ").split(command.conf.separator);
    const { response, args: validatedArgs } = await validateArgs(client, message, args, command.conf.args);

    await command.setMessage(message);
    message.command = command;

    if (!response) await command.run(client, message, validatedArgs);
    else embed(message.channel, {
        title: "Incorrect Usage",
        author: [message.author.tag, message.author.displayAvatarURL()],
        color: "RED",
        description: `${response} Run \`t.help ${command.help.name}\` to view usage information.`
    });
};