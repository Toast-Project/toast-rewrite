import ToastClient from "../classes/ToastClient";
import SlashCommand from "../classes/SlashCommand";

export default async function (client: ToastClient, interaction, command: SlashCommand) {
    const { guild_id, member } = interaction;
    const guild = await client.guilds.cache.get(guild_id);
    if (!guild) return 401;

    const djsMember = await guild.members.cache.get(member.user.id);
    if (!djsMember) return `Error checking member permissions`;

    let permLevel = 0;

    const [mod, admin] = [guild.data?.roles?.mod, guild.data?.roles?.admin];
    const commands = guild.data?.commands || {};

    const cmdLevel = commands[command.help.name]?.permissionLevel || command.conf.permissionLevel || 0;

    if (mod && djsMember.roles.cache.get(mod)) permLevel = 1;
    if (admin && djsMember.roles.cache.get(admin)) permLevel = 2;
    if (djsMember.hasPermission("ADMINISTRATOR")) permLevel = 3;
    if (member.user.id === guild.ownerID) permLevel = 4;
    if (client.config.developers.includes(member.id)) permLevel = 5;

    if (!command.conf.permissionLevel || (permLevel >= cmdLevel)) return;
    else return client.config.permissionLevels[cmdLevel] || `Level ${cmdLevel}`;
}