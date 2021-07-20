import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "permissionlevel",
            description: "View or set a command's permission level.",
            permissionLevel: 3,
            category: "config",
            options: [
                {
                    "type": 1,
                    "name": "view",
                    "description": "View the current permission level",
                    "options": [
                        {
                            "type": 3,
                            "name": "command",
                            "description": "Full name of command",
                            "required": true
                        }
                    ]
                },
                {
                    "type": 1,
                    "name": "set",
                    "description": "Set the permission level",
                    "options": [
                        {
                            "type": 3,
                            "name": "command",
                            "description": "Full name of command",
                            "required": true
                        },
                        {
                            "type": 4,
                            "name": "permission",
                            "description": "Number between 0-4",
                            "required": true
                        }
                    ]
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let subCommand = interaction.options.getSubCommand();
        const command = interaction.options.getString("command");
        const level = interaction.options.getInteger("permission");

        switch (subCommand) {
            case "view":
                const viewCmd = client.commands.get(<string>command);
                if (!viewCmd) return interaction.reply({
                    content: `<:no:811763209237037058> The command provided does not exist.`,
                    ephemeral: true
                });

                const commands = interaction.guild.data?.commands || {};
                const cmdLevel = commands[viewCmd.help.name]?.permissionLevel || viewCmd.conf.permissionLevel || 0;

                return interaction.reply(`The permission level for the \`${viewCmd.help.name}\` command is \`${cmdLevel}\` (${client.config.permissionLevels[cmdLevel]}).`);

            case "set":
                const cmd = client.commands.get(<string>command);
                if (!cmd) return interaction.reply({
                    content: `<:no:811763209237037058> The command provided does not exist.`,
                    ephemeral: true
                });

                if (level > 4 || level < 0) return interaction.reply({
                    content: `<:no:811763209237037058> You must provide a number between 0 and 4.\n\nPermission Levels:\n0 = No Permissions\n1 = Moderator Role\n2 = Administrator Role\n3 = Administrator Permissions\n4 = Server Owner`,
                    ephemeral: true
                });
                if (cmd.conf.restricted) return interaction.reply({
                    content: `<:no:811763209237037058> This command cannot be edited.`,
                    ephemeral: true
                });

                await client.db.guilds.setPermissionLevel(interaction.guild.id, cmd.help.name, <number>level)
                    .catch(e => {
                        return interaction.reply({
                            content: `<:no:811763209237037058> The following error occurred while attempting to set the permission level:\n\`\`\`${e}\`\`\``,
                            ephemeral: true
                        });
                    });

                return interaction.reply(`The permission level for the \`${cmd.help.name}\` command has successfully been set to \`${level}\` (${client.config.permissionLevels[<number>level]}).`);
        }
    }
}