import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "modrole",
            description: "View or set the servers mod role.",
            permissionLevel: 2,
            category: "config",
            options: [
                {
                    "type": 1,
                    "name": "view",
                    "description": "View the current mod role",
                    "options": []
                },
                {
                    "type": 1,
                    "name": "set",
                    "description": "Set the mod role",
                    "options": [
                        {
                            "type": 8,
                            "name": "role",
                            "description": "Mod role",
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
                const modRole = interaction.guild.roles.cache.get(interaction.guild.data?.roles?.mod);
                return interaction.reply({
                    content: `The moderator role for this server${modRole ? ` is ${modRole}.` : " is not yet set up."}`,
                    allowedMentions: { parse: [] }
                });

            case "set":
                await client.db.guilds.setModRole(interaction.guild.id, role.id)
                    .catch(e => {
                        return interaction.reply({
                            content: `<:no:811763209237037058> The following error occurred while attempting to set the mod role:\n\`\`\`${e}\`\`\``,
                            ephemeral: true
                        });
                    });

                return interaction.reply({
                    content: `<:check:811763193453477889> The mod role for the server has successfully been set to ${role}.`,
                    allowedMentions: { parse: [] }
                });
        }
    }
}