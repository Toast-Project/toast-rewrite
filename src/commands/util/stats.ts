import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import Embed from "../../util/functions/embed";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "stats",
            description: "Stats and information about Toast.",
            category: "util",
            restricted: true
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        let totalGuilds: any = await client.shard.fetchClientValues("guilds.cache.size")
        let totalMembers: any = await client.shard.broadcastEval(client => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));

        totalGuilds = totalGuilds.reduce((acc, guildCount) => acc + guildCount, 0);
        totalMembers = totalMembers.reduce((acc, memberCount) => acc + memberCount, 0);
        const heapUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const embed = Embed({
            title: "Toast Information",
            fields: [
                ["Server",
                    `• **Mem Usage:** ${heapUsed}MB\n` +
                    `• **Uptime:** ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds\n` +
                    `• **Node.JS:** ${process.version}\n`+
                    `• **Shards:** ${client.shard.count}`
                ],
                ["Stats", `• **Guilds:** ${totalGuilds}\n• **Users:** ${totalMembers}`],
                ["Links", "[Toast Invite](https://discord.com/api/oauth2/authorize?client_id=811387435018879026&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%2Fauth%2Fdiscord%2Fcallback&scope=bot%20applications.commands), [Support Server](discord.gg/5KXfHq948f)"]
            ]
        });

        return interaction.reply({ embeds: [embed] });
    }
}