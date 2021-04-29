import RandomString from "jvar/utility/randomString";
import Command from "../classes/Command";

interface CommandHelp {
    name: string,
    description: string,
    usage: Array<string>,
    category?: string
}

interface CommandConf {
    permLevel?: number,
    cooldown?: number,
    aliases?: Array<string>,
    allowDMs?: boolean,
    args?: Object
}

declare module "discord.js" {
    interface Client {
        commands: Collection<string, Command>;
        config: Record<string, any>;
        randomString: RandomString;
        clean: any;
        db: any;
    }

    interface Message {
        command?: Command;
        response?: Message;
    }

    interface User {
        data?: any;
    }

    interface GuildMember {
        data?: any;
    }

    interface Guild {
        data?: any;
    }
}

declare module "mongodb" {
    interface Db {
        clientStorage?: any;
        guilds?: any;
        guildShop?: any;
        members?: any;
        mutes?: any;
        warnings?: any;
        suggestions?: any;
        tags?: any;
        users?: any;
    }
}
