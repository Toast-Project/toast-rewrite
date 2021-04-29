import Dao from "./Dao";

export default class ClientDao extends Dao {
    constructor(db) {
        super(db, "clientStorage");
    }

    storeCommands(commands) {
        return this.update("0", { commands });
    }
}