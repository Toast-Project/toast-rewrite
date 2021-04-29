import Dao from "./Dao";

export default class WarningDao extends Dao {
    constructor(db) {
        super(db, "warnings");
    }

    clear(guildId, userId) {
        return this.collection.deleteMany({ guild: guildId, user: userId });
    }

    getCount(guildId, userId) {
        return this.count({ guild: guildId, user: userId });
    }
}