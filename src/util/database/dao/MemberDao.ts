import Dao from "./Dao";

export default class MemberDao extends Dao {
    constructor(db) {
        super(db, "members");
    }

    findByGuild(guild: string) {
        return this.find({ guild });
    }

    findByUser(user: string) {
        return this.find({ user });
    }

    get(guild: string, user: string) {
        const id = guild + "_" + user;
        return super.get(id);
    }

    cursorByGuild(guild: string) {
        return this.collection.find({ guild });
    }

    cursorByUser(user: string) {
        return this.collection.find({ user });
    }

    setXp(guild: string, user: string, xp: number = 0) {
        const id = guild + "_" + user;
        return this.update(id, { xp });
    }

    modXp(guild: string, user: string, amount: number) {
        const id = guild + "_" + user;
        return this.inc(id, 'xp', amount);
    }

    setBalance(guild: string, user: string, balance: number = 0) {
        const id = guild + "_" + user;
        return this.update(id, { balance });
    }

    modBalance(guild: string, user: string, change: number = 0) {
        const id = guild + "_" + user;
        return this.inc(id, 'balance', change);
    }

    modWorth(guild: string, user: string, change: number = 0) {
        const id = guild + "_" + user;
        return this.inc(id, 'worth', change);
    }

    setBank(guild: string, user: string, balance: number = 0) {
        const id = guild + "_" + user;
        return this.update(id, { bank: balance });
    }

    modBank(guild: string, user: string, change: number = 0) {
        const id = guild + "_" + user;
        return this.inc(id, 'bank', change);
    }

    setRobbedBy(guild: string, user: string, target: string) {
        const id = guild + "_" + user;
        return this.update(id, { robbedBy: target });
    }

    addItem(guild: string, user: string, item: string) {
        const id = guild + "_" + user;
        return this.push(id, 'items', item);
    }

    setLastWork(guild: string, user: string, lastWork: number = Date.now()) {
        const id = guild + "_" + user;
        return this.update(id, { lastWork });
    }

    setLastCrime(guild: string, user: string, lastCrime: number = Date.now()) {
        const id = guild + "_" + user;
        return this.update(id, { lastCrime });
    }

    setLastRob(guild: string, user: string, lastRob: number = Date.now()) {
        const id = guild + "_" + user;
        return this.update(id, { lastRob });
    }

    setLastDaily(guild: string, user: string, lastDaily: number = Date.now()) {
        const id = guild + "_" + user;
        return this.update(id, { lastDaily });
    }
}