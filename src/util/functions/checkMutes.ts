import { Guild, GuildMember, Role } from "discord.js";
import ToastClient from "../classes/ToastClient";

export default async function (client: ToastClient) {
    const mutes = await client.db.mutes.all();

    for (const mute in mutes) {
        const { guild, user, createdAt, duration, active } = mutes[mute];

        if (((createdAt + duration) <= Date.now()) && active) {
            const guildData = await client.db.guilds.get(guild);
            const g: Guild = client.guilds.cache.get(guild);
            if (!g) continue;

            const role = guildData?.roles?.mute;

            const r: Role = g.roles.cache.get(role);
            if (!r) continue;

            const m: GuildMember = await g.members.fetch(user);
            if (!m) continue;

            await m.roles.remove(r);
        }
    }
}