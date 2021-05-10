import { Client, Collection } from "discord.js";

interface Help {
    name: string;
    description: string;
}

interface Conf {
    permissionLevel?: number;
    cooldown?: number;
    path?: any;
}

type CommandOptions = Help & Conf;

export default abstract class SlashCommand {
    public conf: Conf;
    public help: Help;
    public cooldown: Collection<any, any>;

    protected constructor(public client: Client, options: CommandOptions) {
        this.client = client;

        this.help = {
            name: options.name || null,
            description: options.description || "No information specified.",
        };

        this.conf = {
            permissionLevel: options.permissionLevel || 0,
            cooldown: options.cooldown || 0,
            path: options.path || null
        };

        this.cooldown = new Collection();
    }

    startCooldown(guild, user) {
        if (!this.cooldown.get(guild)) this.cooldown.set(guild, new Set());
        this.cooldown.get(guild).add(user);

        setTimeout(() => {
            this.cooldown.get(guild).delete(user);
        }, this.conf.cooldown);
    }

    public abstract run(...args: readonly unknown[]): unknown;
}