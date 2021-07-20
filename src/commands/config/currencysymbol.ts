import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction } from "discord.js";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "currencysymbol",
            description: "Set a custom currency symbol.",
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
                    "name": "set",
                    "description": "Set the currency symbol",
                    "options": [
                        {
                            "type": 3,
                            "name": "symbol",
                            "description": "Currency symbol",
                            "required": true
                        }
                    ]
                }
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let subCommand = interaction.options.getSubCommand();
        const symbol: string = interaction.options.getString("symbol");

        switch (subCommand) {
            case "view":
                const currencySymbol = interaction.guild.channels.cache.get(interaction.guild.data?.economy?.symbol);
                return interaction.reply(`The currency symbol for this server is set to ${currencySymbol || "$"}.`);

            case "set":
                if (symbol.length > 30) return interaction.reply({
                    content: `<:no:811763209237037058> The character limit for currency symbols are 30 characters.`,
                    ephemeral: true
                });

                await client.db.guilds.setCurrencySymbol(interaction.guild.id, symbol)
                    .catch(e => {
                        return interaction.reply({
                            content: `<:no:811763209237037058> The following error occurred while attempting to set the currency symbol:\n\`\`\`${e}\`\`\``,
                            ephemeral: true
                        });
                    });

                return interaction.reply(`<:check:811763193453477889> The currency symbol for the server has successfully been set to ${symbol}.`);
        }
    }
}