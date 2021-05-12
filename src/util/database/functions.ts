import ToastClient from "../classes/ToastClient";
import { init } from "./mongo";
import ClientDao from "./dao/ClientDao";
import GuildDao from "./dao/GuildDao";
import WarningDao from "./dao/WarningDao";
import GuildShopDao from "./dao/GuildShopDao";
import MemberDao from "./dao/MemberDao";
import MuteDao from "./dao/MuteDao";
import SuggestionDao from "./dao/SuggestionDao";
import TagDao from "./dao/TagDao";
import UserDao from "./dao/UserDao";
import ReminderDao from "./dao/ReminderDao";

interface Dao {
    clientStorage?: any;
    guilds?: any;
    guildShop?: any;
    members?: any;
    mutes?: any;
    warnings?: any;
    suggestions?: any;
    tags?: any;
    users?: any;
    reminders?: any;
}

type DBoptions = Dao;

export default async (client: ToastClient) => {
    const db: DBoptions = await init();
    db.clientStorage = new ClientDao(db);
    db.guilds = new GuildDao(db);
    db.guildShop = new GuildShopDao(db);
    db.members = new MemberDao(db);
    db.mutes = new MuteDao(db);
    db.users = new UserDao(db);
    db.warnings = new WarningDao(db);
    db.suggestions = new SuggestionDao(db);
    db.tags = new TagDao(db);
    db.reminders = new ReminderDao(db);
    db.clientStorage = new ClientDao(db);
    client.db = db;
}