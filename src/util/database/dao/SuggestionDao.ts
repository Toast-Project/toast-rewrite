import Dao from "./Dao";

export default class SuggestionDao extends Dao {
    constructor(db) {
        super(db, "suggestions");
    }

    clear(guildId, suggestionId) {
        return this.collection.deleteMany({ guild: guildId, _id: suggestionId });
    }

    accept(guildId, suggestionId, reason) {
        const query = { guild: guildId, _id: suggestionId };
        return this.collection.updateOne(query, { $set: { status: "accepted", modNote: reason || null } });
    }

    deny(guildId, suggestionId, reason) {
        const query = { guild: guildId, _id: suggestionId };
        return this.collection.updateOne(query, { $set: { status: "declined", modNote: reason || null } });
    }

    updateMessage(guildId, suggestionId, id) {
        const query = { guild: guildId, _id: suggestionId };
        return this.collection.updateOne(query, { $set: { messageId: id } });
    }

    note(guildId, suggestionId, modNote) {
        const query = { guild: guildId, _id: suggestionId };
        return this.collection.updateOne(query, { $set: { modNote } });
    }
}