import Dao from "./Dao";

export default class TagDao extends Dao {
    constructor(db) {
        super(db, "tags");
    }

    editContent(guildId, name, content) {
        const query = { guild: guildId, name };
        return this.collection.updateOne(query, { $set: { content: content } });
    }
}