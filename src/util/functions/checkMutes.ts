import { Guild, GuildMember, Role } from "discord.js";
import ToastClient from "../classes/ToastClient";

export default async function (client: ToastClient) {
    console.log("dad");
    const mutes = await client.db.mutes.find({ active: true });
    console.log(mutes);
    for (const { guild, user, createdAt, duration } of mutes) {
        const endsAt = createdAt + duration;
        if (endsAt > Date.now()) continue;

        await client.db.mutes.deactivate(guild, user);

        const g: Guild = client.guilds.cache.get(guild);
        const role = g?.data?.roles?.mute;

        const r: Role = g.roles.cache.get(role);
        if (!r) continue;

        const m: GuildMember = await g.members.fetch(user);
        if (!m) continue;

        await m.roles.remove(r);
    }
}