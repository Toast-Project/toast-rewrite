import { Client, Collection, Message } from "discord.js";

interface Help {
    name: string;
    description: string;
    usage: Array<string>;
    category?: string;
}

interface Conf {
    permLevel?: number;
    cooldown?: number;
    aliases?: Array<string>;
    allowDMs?: boolean;
    args?: Object;
    saveResponse?: boolean;
    separator?: string;
    hidden?: boolean;
    locked?: boolean;
}

type CommandOptions = Help & Conf;

export default abstract class Command {
    public conf: Conf;
    public help: Help;
    public cooldown: Collection<any, any>;
    public message: Message;

    protected constructor(public client: Client, options: CommandOptions) {
        this.client = client;

        this.help = {
            name: options.name || null,
            description: options.description || "No information specified.",
            usage: options.usage || [],
        };

        this.conf = {
            permLevel: options.permLevel || 0,
            cooldown: options.cooldown || 0,
            aliases: options.aliases || null,
            allowDMs: options.allowDMs || false,
            args: options.args || null,
            saveResponse: options.saveResponse || false,
            separator: options.separator || " ",
            hidden: options.hidden || false,
            locked: options.locked || false
        };

        this.cooldown = new Collection();
    }

    setCategory(category) {
        this.help.category = category;
    }

    startCooldown(guild, user) {
        if (!this.cooldown.get(guild)) this.cooldown.set(guild, new Set());
        this.cooldown.get(guild).add(user);

        setTimeout(() => {
            this.cooldown.get(guild).delete(user);
        }, this.conf.cooldown);
    }

    setMessage(message) {
        this.message = message;
    }

    async send(message: any) {
        this.message.response = await this.message.channel.send(message);
    }

    public abstract run(...args: readonly unknown[]): unknown;
}