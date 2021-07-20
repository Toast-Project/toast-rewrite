import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

const modules = ["leveling", "economy", "suggestions"]

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "module",
            description: "View or set a command's permission level.",
            permissionLevel: 3,
            category: "config",
            options: [
                {
                    "type": 1,
                    "name": "view",
                    "description": "Check the status on all modules",
                    "options": []
                },
                {
                    "type": 1,
                    "name": "set",
                    "description": "Enable/disable a module",
                    "options": [
                        {
                            "type": 3,
                            "name": "module",
                            "description": "suggestions, economy, leveling",
                            "required": true
                        },
                        {
                            "type": 5,
                            "name": "enable",
                            "description": "Enable or disable",
                            "required": true
                        }
                    ]
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let subCommand = interaction.options.getSubCommand();
        const module = interaction.options.getString("module");
        const bool = interaction.options.getBoolean("enable");

        switch (subCommand) {
            case "view":
                const guildData = interaction.guild.data;
                const { economy = false, leveling = false, suggestions = false } = guildData?.modules || {};

                if (!modules.includes(<string>module)) return interaction.reply({
                    content: `<:no:811763209237037058> Available modules are \`suggestions\`, \`economy\`, \`leveling\`.`,
                    ephemeral: true
                });

                return interaction.reply(`Economy: ${economy}\nLeveling: ${leveling}\nSuggestions: ${suggestions}`);

            case "set":
                if (!modules.includes(<string>module)) return interaction.reply({
                    content: `<:no:811763209237037058> Available modules are \`suggestions\`, \`economy\`, \`leveling\`.`,
                    ephemeral: true
                });

                await client.db.guilds.setModule(interaction.guild.id, <string>module, <boolean>bool)
                    .catch(e => {
                        return interaction.reply({
                            content: `<:no:811763209237037058> The following error occurred while attempting to toggle the module:\n\`\`\`${e}\`\`\``,
                            ephemeral: true
                        });
                    });

                return interaction.reply(`The \`${module}\` module is now set to ${bool}.`);
        }
    }
}