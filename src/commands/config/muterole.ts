import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "muterole",
            description: "View or set the servers muted role.",
            permissionLevel: 2,
            category: "config",
            options: [
                {
                    "type": 1,
                    "name": "view",
                    "description": "View the current muted role",
                    "options": []
                },
                {
                    "type": 1,
                    "name": "set",
                    "description": "Set the muted role",
                    "options": [
                        {
                            "type": 8,
                            "name": "role",
                            "description": "Mute role",
                            "required": true
                        }
                    ]
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let subCommand = interaction.options.getSubCommand();
        const role = interaction.options.getRole("role");

        switch (subCommand) {
            case "view":
                const muteRole = interaction.guild.roles.cache.get(interaction.guild.data?.roles?.mute);
                return interaction.reply({
                    content: `The muted role for this server${muteRole ? ` is ${muteRole}.` : " is not yet set up."}`,
                    allowedMentions: { parse: [] }
                });

            case "set":
                await client.db.guilds.setMuteRole(interaction.guild.id, role.id)
                    .catch(e => {
                        return interaction.reply({
                            content: `<:no:811763209237037058> The following error occurred while attempting to set the muted role:\n\`\`\`${e}\`\`\``,
                            ephemeral: true
                        });
                    });

                return interaction.reply({
                    content: `<:check:811763193453477889> The muted role for the server has successfully been set to ${role}.`,
                    allowedMentions: { parse: [] }
                });
        }
    }
}