import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "logchannel",
            description: "Set a log channel or disable logging.",
            permissionLevel: 2,
            category: "config",
            options: [
                {
                    "type": 1,
                    "name": "view",
                    "description": "View the current log channel",
                    "options": []
                },
                {
                    "type": 1,
                    "name": "disable",
                    "description": "Disable logging",
                    "options": []
                },
                {
                    "type": 1,
                    "name": "set",
                    "description": "Set the log channel",
                    "options": [
                        {
                            "type": 7,
                            "name": "channel",
                            "description": "Log channel",
                            "required": true
                        }
                    ]
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let subCommand = interaction.options[0].name;
        const channel = interaction.options[0].options?.[0].value;

        let newChannel;
        if (channel) newChannel = await interaction.guild.channels.cache.get(channel.toString());

        switch (subCommand) {
            case "view":
                const logChannel = interaction.guild.channels.cache.get(interaction.guild.data?.channels?.log);
                return interaction.reply(`The log channel for this server${logChannel ? ` is ${logChannel}.` : " is not yet set up."}`);

            case "disable":
                await client.db.guilds.setLogChannel(interaction.guild.id, null)
                    .catch(e => {
                        return interaction.reply({ content: `<:no:811763209237037058> The following error occurred while attempting to set the log channel:\n\`\`\`${e}\`\`\``, ephemeral: true });
                    });

                return interaction.reply("<:check:811763193453477889> Logging has successfully been disabled for this server.");

            case "set":
                await client.db.guilds.setLogChannel(interaction.guild.id, newChannel.id)
                    .catch(e => {
                        return interaction.reply({ content: `<:no:811763209237037058> The following error occurred while attempting to set the log channel:\n\`\`\`${e}\`\`\``, ephemeral: true });
                    });

                return interaction.reply(`<:check:811763193453477889> The log channel for the server has successfully been set to ${newChannel}.`);
        }
    }
}