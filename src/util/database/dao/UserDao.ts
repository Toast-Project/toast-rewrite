import Dao from "./Dao";

export default class UserDao extends Dao {
    constructor(db) {
        super(db, "users");
    }

    setPremium(id, premium) {
        return this.update(id, { premium });
    }

    setBlacklisted(id, blacklisted) {
        return this.update(id, { blacklisted });
    }
}