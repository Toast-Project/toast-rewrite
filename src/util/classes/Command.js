const { Collection } = require("discord.js");

class Command {
    constructor(client, options) {
        this.client = client;

        this.help = {
            name: options.name || null,
            description: options.description || "No information specified.",
            usage: options.usage || []
        };

        this.conf = {
            permLevel: options.permLevel || 0,
            cooldown: options.cooldown || 0,
            aliases: options.aliases || [],
            allowDMs: options.allowDMs || false
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

    setMessage(message) {
        this.message = message;
    }

    send(message) {
        this.message.channel.send(message);
    }
}

module.exports = Command;