import { ApplicationCommandData, Client, Collection } from "discord.js";

interface Help {
    name: string;
    description: string;
    category?: string;
}

interface Conf {
    permissionLevel?: number;
    cooldown?: number;
    path?: any;
    hidden?: boolean;
    restricted?: boolean;
    options?: any;
    disabled?: boolean
}

type CommandOptions = Help & Conf;

export default abstract class Command implements ApplicationCommandData {
    public name: string;
    public description: string;
    public options: Array<any>;
    public conf: Conf;
    public help: Help;
    public cooldown: Collection<any, any>;
    public disabled: boolean;

    protected constructor(public client: Client, options: CommandOptions) {
        this.client = client;
        this.name = options.name || null;
        this.description = options.description || null;
        this.options = options.options || null;
        this.name = options.name || null;

        this.help = {
            name: options.name || null,
            description: options.description || "No information specified.",
            category: options.category || null
        };

        this.conf = {
            permissionLevel: options.permissionLevel || 0,
            cooldown: options.cooldown || 0,
            path: options.path || null,
            hidden: options.hidden || false,
            restricted: options.restricted || false,
            options: options.options || null,
            disabled: options.disabled || false
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