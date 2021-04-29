import Dao from "./Dao";

export default class MemberDao extends Dao {
    constructor(db) {
        super(db, "members");
    }

    findByGuild(guild) {
        return this.find({ guild });
    }

    findByUser(user) {
        return this.find({ user });
    }

    get(guild, user) {
        const id = guild + "_" + user;
        return super.get(id);
    }

    cursorByGuild(guild) {
        return this.collection.find({ guild });
    }

    cursorByUser(user) {
        return this.collection.find({ user });
    }

    setXp(guild, user, xp = 0) {
        const id = guild + "_" + user;
        return this.update(id, { xp });
    }

    modXp(guild, user, amount) {
        const id = guild + "_" + user;
        return this.inc(id, 'xp', amount);
    }

    setBalance(guild, user, balance = 0) {
        const id = guild + "_" + user;
        return this.update(id, { balance });
    }

    modBalance(guild, user, change = 0) {
        const id = guild + "_" + user;
        return this.inc(id, 'balance', change);
    }

    modWorth(guild, user, change = 0) {
        const id = guild + "_" + user;
        return this.inc(id, 'worth', change);
    }

    setBank(guild, user, balance = 0) {
        const id = guild + "_" + user;
        return this.update(id, { bank: balance });
    }

    modBank(guild, user, change = 0) {
        const id = guild + "_" + user;
        return this.inc(id, 'bank', change);
    }

    setRobbedBy(guild, user, target) {
        const id = guild + "_" + user;
        return this.update(id, { robbedBy: target });
    }

    addItem(guild, user, item) {
        const id = guild + "_" + user;
        return this.push(id, 'items', item);
    }

    setLastWork(guild, user, lastWork = Date.now()) {
        const id = guild + "_" + user;
        return this.update(id, { lastWork });
    }

    setLastCrime(guild, user, lastCrime = Date.now()) {
        const id = guild + "_" + user;
        return this.update(id, { lastCrime });
    }

    setLastRob(guild, user, lastRob = Date.now()) {
        const id = guild + "_" + user;
        return this.update(id, { lastRob });
    }

    setLastDaily(guild, user, lastDaily = Date.now()) {
        const id = guild + "_" + user;
        return this.update(id, { lastDaily });
    }
}