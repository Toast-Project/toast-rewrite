export default async function (client) {
    const mutes = await client.db.mutes.find({ active: true });

    for (const { guild, user, createdAt, role, duration } of mutes) {
        const endsAt = createdAt + duration;
        if (endsAt > Date.now()) continue;

        await client.db.mutes.deactivate(guild, user);

        const g = client.guilds.cache.get(guild);

        const r = g.roles.cache.get(role);
        if (!r) continue;

        const m = await g.members.fetch(user);
        if (!m) continue;

        m.roles.remove(r);
    }
}