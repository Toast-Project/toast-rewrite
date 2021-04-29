import Dao from "./Dao";

export default class MuteDao extends Dao {
    constructor(db) {
        super(db, "mutes");
    }

    clear(guildId, userId) {
        return this.collection.deleteMany({ guild: guildId, target: userId });
    }

    findActive(guildId, userId) {
        return this.findOne({ guild: guildId, user: userId, active: true });
    }

    getCount(guildId, userId) {
        return this.count({ guild: guildId, user: userId });
    }

    deactivate(guildId, userId) {
        const query = { guild: guildId, user: userId, active: true };
        return this.collection.updateOne(query, { $set: { active: false } });
    }
}