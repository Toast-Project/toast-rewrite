import ToastClient from "../classes/ToastClient";
import validateArgs from "../functions/validateArgs";
import Command from "../classes/Command";
import { Message } from "discord.js";
import embed from "./embed";
import checkPermissions from "./checkPermissions";

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

    const noPermissions = await checkPermissions(client, message, command);
    if (noPermissions) return await message.channel.send(
        embed({
            title: "Missing Permissions",
            author: [message.author.tag, message.author.displayAvatarURL()],
            color: "RED",
            description: `The minimum permission level required to run this command is: \`${noPermissions}\``
        })
    );

    if (!response) {
        await command.run(client, message, validatedArgs);
        command.startCooldown(message.guild.id, message.author.id);
    } else await message.channel.send(
        embed({
            title: "Incorrect Usage",
            author: [message.author.tag, message.author.displayAvatarURL()],
            color: "RED",
            description: `${response} Run \`${message.guild.data.prefix || "t."}help ${command.help.name}\` to view usage information.`
        })
    );
};