import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, GuildMember, Role } from "discord.js";
import embed from "../../util/functions/embed";
import userPermissions from "../../util/functions/userPermissions";
import { APIRole } from "discord-api-types";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "shop",
            description: "View/create shop items.",
            category: "social",
            options: [
                {
                    "type": 1,
                    "name": "view",
                    "description": "View the items in the shop",
                    "options": [
                        {
                            "type": 3,
                            "name": "name",
                            "description": "Find an item by name",
                            "default": false,
                            "required": false
                        }
                    ]
                },
                {
                    "type": 1,
                    "name": "create",
                    "description": "Create a shop item",
                    "options": [
                        {
                            "type": 3,
                            "name": "name",
                            "description": "Item name (64 character max)",
                            "default": false,
                            "required": true
                        },
                        {
                            "type": 3,
                            "name": "description",
                            "description": "Item description (64 character max)",
                            "default": false,
                            "required": true
                        },
                        {
                            "type": 4,
                            "name": "cost",
                            "description": "Item cost",
                            "default": false,
                            "required": true
                        },
                        {
                            "type": 4,
                            "name": "limit",
                            "description": "How many users can purchase this item",
                            "default": false,
                            "required": false
                        },
                        {
                            "type": 8,
                            "name": "role",
                            "description": "Users who purchase will receive the provided role",
                            "default": false,
                            "required": false
                        }
                    ]
                },
                {
                    "type": 1,
                    "name": "delete",
                    "description": "Delete a shop item",
                    "options": [
                        {
                            "type": 3,
                            "name": "id",
                            "description": "ID of item",
                            "default": false,
                            "required": true
                        }
                    ]
                },
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let subCommand = interaction.options.getSubCommand();
        const itemName = interaction.options.getString("name");

        const { economy = {} } = interaction.guild.data;
        const symbol = economy.symbol || "$";

        switch (subCommand) {
            case "view":
                const guildShop = await client.db.guildShop.find({ guild: interaction.guild.id });
                if (guildShop.length < 1) return interaction.reply("The shop is empty.");

                if (itemName) {
                    let item = await client.db.guildShop.find({
                        name: { "$regex": itemName, $options: "i" },
                        guild: interaction.guild.id
                    });
                    if (item.length > 0) item = item[0];
                    if (item.length < 1) break;

                    const reply = embed({
                        title: "Item: " + item.name,
                        description: `${item.description}\n**Price: ${symbol}${item.cost}**\n**Role: ${item.role ? `<@&${item.role}>` : "None"}**\n${item.limit > 0 ? `${item.uses}/${item.limit} owned` : `${item.uses}/∞ owned`}`,
                        footer: ["Shop"]
                    });

                    return interaction.reply({ embeds: [reply] });
                } else {
                    const cursor = await client.db.guildShop.collection.find({ guild: interaction.guild.id });
                    const items = await cursor
                        .sort({ sort: -1 })
                        .limit(15)
                        .toArray();

                    const description = items.map(({ _id, name, description, cost, limit, role, uses = 0 }) => {
                        const r = interaction.guild.roles.cache.get(role);

                        return [
                            `(${_id})`,
                            "**Name: **" + name,
                            "**Description: **" + description,
                            "**Price: **" + symbol + cost,
                            "**Role: **" + `${r ? `<@&${r.id}>` : "None"}`,
                            `${limit > 0 ? `${uses}/${limit} owned` : `${uses}/∞ owned`}`
                        ];
                    }).flatMap(e => e.concat(""));
                    console.log(description);
                    const reply = await embed({
                        title: "Shop",
                        description
                    });

                    return interaction.reply({ embeds: [reply] });
                }

            case "create":
                const permLevel = await userPermissions(client, interaction, <GuildMember>interaction.member);
                if (2 > permLevel) return interaction.reply({
                    content: `The minimum permission level required to run this command is: \`Administrator Role\`.`,
                    ephemeral: true
                });

                const name: string = interaction.options.getString("name");
                const description: string = interaction.options.getString("description");
                const cost: number = interaction.options.getInteger("cost");
                const limit: number = interaction.options.getInteger("limit")
                const role: Role | APIRole = interaction.options.getRole("role");

                if (name.length > 64 || description.length > 64) return interaction.reply({
                    content: "The name and description both have to be under 64 characters.",
                    ephemeral: true
                });

                const id = client.randomId();
                await client.db.guildShop.insert({
                    _id: id,
                    guild: interaction.guild.id,
                    name,
                    description,
                    cost,
                    limit,
                    role: role?.id || null,
                    uses: 0
                });

                const reply = embed({
                    title: "Shop",
                    description: `<:check:811763193453477889> Created "${name}" (id ${id})` +
                        "\nPrice: " + symbol + cost +
                        "\nRole: " + (role ? role : "none") +
                        "\nLimit: " + (limit > 0 ? limit : "none")
                });

                return interaction.reply({ embeds: [reply] });

            case "delete":
                if (2 > await userPermissions(client, interaction, <GuildMember>interaction.member)) return interaction.reply({
                    content: `The minimum permission level required to run this command is: \`Administrator Role\`.`,
                    ephemeral: true
                });

                const item = await client.db.guildShop.findOne({
                    _id: interaction.options.getString("id"),
                    guild: interaction.guild.id
                });
                if (!item) return interaction.reply({
                    content: "<:no:811763209237037058> The provided ID is invalid.",
                    ephemeral: true
                });

                await client.db.guildShop.delete(item._id)
                    .catch(e => {
                        return interaction.reply({
                            content: `<:no:811763209237037058> The following error occurred while attempting to delete this item:\n\`\`\`${e}\`\`\``,
                            ephemeral: true
                        });
                    });

                return interaction.reply(`<:check:811763193453477889> Successfully deleted \`(${item._id})\` ${item.name} from the shop.`);
        }
    }
}