export default async function (client) {
    const reminders = await client.db.reminders.all();

    for (const reminder in reminders) {
        const { _id, duration, createdAt, user, text, channel } = reminders[reminder];

        if ((createdAt + duration) >= Date.now()) {
            const commandChannel = await client.channels.cache.get(channel);
            if (channel) commandChannel.send(`<@!${user}>: You asked me to remind you: \`${text}\``)
                .catch(() => null);
            await client.db.reminders.delete(_id);
        }
    }
}