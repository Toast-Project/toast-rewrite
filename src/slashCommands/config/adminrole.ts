import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends SlashCommand {
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
        let subCommand = interaction.options[0].name;
        const role = interaction.options[0].options?.[0].value;

        let newRole;
        if (role) newRole = await interaction.guild.roles.fetch(role.toString());

        switch (subCommand) {
            case "view":
                const adminRole = interaction.guild.roles.cache.get(interaction.guild.data?.roles?.admin);
                return interaction.reply(`The administrator role for this server${adminRole ? ` is ${adminRole}.` : " is not yet set up."}`, { allowedMentions: { parse: [] } });

            case "set":
                await client.db.guilds.setAdminRole(interaction.guild.id, newRole.id)
                    .catch(e => {
                        return interaction.reply(`<:no:811763209237037058> The following error occurred while attempting to set the admin role:\n\`\`\`${e}\`\`\``, { ephemeral: true });
                    });

                return interaction.reply(`<:check:811763193453477889> The admin role for the server has successfully been set to ${newRole}.`, { allowedMentions: { parse: [] } });
        }
    }
}