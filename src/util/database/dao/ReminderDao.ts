import Dao from "./Dao";

export default class SuggestionDao extends Dao {
    constructor(db) {
        super(db, "reminders");
    }
}