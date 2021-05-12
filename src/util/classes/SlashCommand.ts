import { Client, Collection } from "discord.js";

interface Help {
    name: string;
    description: string;
    category: string;
}

interface Conf {
    permissionLevel?: number;
    cooldown?: number;
    path?: any;
    hidden?: boolean;
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
            category: options.category || "NA"
        };

        this.conf = {
            permissionLevel: options.permissionLevel || 0,
            cooldown: options.cooldown || 0,
            path: options.path || null,
            hidden: options.hidden || false
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

    post(client, interaction, data) {
        return client["api"]["interactions"](interaction.id)(interaction.token).callback.post({ data });
    }

    public abstract run(...args: readonly unknown[]): unknown;
}