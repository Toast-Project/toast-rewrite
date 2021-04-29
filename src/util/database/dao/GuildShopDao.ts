import Dao from "./Dao";

export default class GuildShopDao extends Dao {
    constructor(db) {
        super(db, "guild_shop");
    }

    setName(id, name) {
        return this.update(id, { name });
    }

    setDescription(id, description) {
        return this.update(id, { description });
    }

    setPrice(id, price) {
        return this.update(id, { price });
    }

    setLimit(id, limit) {
        return this.update(id, { limit });
    }

    setRole(id, role) {
        return this.update(id, { role });
    }

    setSort(id, sort = 0) {
        return this.update(id, { sort });
    }

    addUses(id, amount = 0) {
        return this.inc(id, 'uses', amount);
    }

    decUses(id, amount = 0) {
        return this.inc(id, 'uses', -amount);
    }
}