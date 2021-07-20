import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, Role } from "discord.js";
import { APIRole } from "discord-api-types";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "adminrole",
            description: "View or set the servers admin role.",
            permissionLevel: 3,
            category: "config",
            options: [
                {
                    "type": 1,
                    "name": "view",
                    "description": "View the current admin role",
                    "options": []
                },
                {
                    "type": 1,
                    "name": "set",
                    "description": "Set the admin role",
                    "options": [
                        {
                            "type": 8,
                            "name": "role",
                            "description": "Admin role",
                            "required": true
                        }
                    ]
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let subCommand = interaction.options.getSubCommand();
        const role: Role | APIRole = interaction.options.getRole("role");

        switch (subCommand) {
            case "view":
                const adminRole = interaction.guild.roles.cache.get(interaction.guild.data?.roles?.admin);
                return interaction.reply({
                    content: `The administrator role for this server${adminRole ? ` is ${adminRole}.` : " is not yet set up."}`,
                    allowedMentions: { parse: [] }
                });

            case "set":
                await client.db.guilds.setAdminRole(interaction.guild.id, role.id)
                    .catch(e => {
                        return interaction.reply({
                            content: `<:no:811763209237037058> The following error occurred while attempting to set the admin role:\n\`\`\`${e}\`\`\``,
                            ephemeral: true
                        });
                    });

                return interaction.reply({
                    content: `<:check:811763193453477889> The admin role for the server has successfully been set to ${role}.`,
                    allowedMentions: { parse: [] }
                });
        }
    }
}