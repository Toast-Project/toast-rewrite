import ms from "ms";
import { Collection, Message } from "discord.js";
import ToastClient from "../classes/ToastClient";

function getId(str) {
    return ((str || "").match(/\d+/g) || [])[0];
}

async function getUser(client, input) {
    if (!input) return null;
    return await client.users.fetch(getId(input)).catch(() => null);
}

async function getMember(guild, input) {
    if (!input) return null;
    const data = await guild.members.fetch(getId(input)).catch(() => null);
    return data instanceof Collection ? null : data;
}

async function getChannel(guild, input) {
    if (!input) return null;
    return await guild.channels.cache.get(getId(input)) || null;
}

async function getRole(guild, input) {
    return await guild.roles.cache.get(getId(input)) || null;
}

async function getCommand(client, input) {
    return (client.commands.get(input) || client.commands.find(cmd => cmd.conf.aliases && cmd.conf.aliases.includes(input))) || null;
}

async function getValue(client, guild, type, input) {
    if (typeof input === "object") {
        let valueToReturn = [];
        for (const item of input) {
            const output = await getValue(client, guild, type, item);
            if (!output) return null;
            valueToReturn.push(output);
        }
        return valueToReturn;
    }

    switch (type) {
        case "string":
            if (typeof input === "string") return input;
            return null;

        case "integer":
            return (!input || isNaN(parseInt(input))) ? null : parseInt(input);

        case "float":
            return (!input || isNaN(parseFloat(input))) ? null : parseFloat(input);

        case "bigint":
            return BigInt(input);

        case "duration":
            if (!input || typeof input !== "string") return null;
            return ms(input);

        case "user":
            return await getUser(client, input);

        case "member":
            return await getMember(guild, input);

        case "channel":
            return await getChannel(guild, input);

        case "role":
            return await getRole(guild, input);

        case "command":
            return await getCommand(client, input);
    }
}

export default async function (client: ToastClient, message: Message, args: any[], commandArgs?: Object) {
    let i = 0;
    let newArgs = [];
    let response: any = [];

    for (const data in commandArgs) {
        const { required, type: t } = commandArgs[data];
        let type = t.toString();

        if (required && !args[i]) {
            response = `Incorrect command usage. You must provide a valid: ${data} (\`${type}\`).`;
            break;
        }

        if (type.startsWith("...") && (i === Object.keys(commandArgs).length - 1)) {
            type = type.replace("...", "");
            args[i] = args.splice(Object.keys(commandArgs).length - 1);
        }

        if ((!type || type === "any") && args[i]) {
            newArgs.push(args[i]);
            i++;
            continue;
        }

        const newValue = await getValue(client, message.guild, type, args[i]);
        if (!newValue && required && (args[i] !== 0)) {
            response = `Incorrect command usage. You must provide a valid: ${data} (\`${type}\`).`;
            break;
        }

        newArgs.push(newValue);
        i++;
    }

    if (!response.length) {
        response = null;
    }

    return { args: newArgs.length >= 1 ? newArgs : args, response };
}