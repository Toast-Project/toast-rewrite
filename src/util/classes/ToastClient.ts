import { Client, Collection } from "discord.js";
import config from "../../config";
import { lstatSync, readdirSync } from "fs";
import { join } from "@fireflysemantics/join";
import { resolve } from "path";
import Event from "./Event";
import Database from "../database/functions";
import Command from "./Command";
import checkReminders from "../functions/checkReminders";
import checkMutes from "../functions/checkMutes";
import randomString = require("jvar/utility/randomString");

const slashCommandsDirectory = resolve(__dirname, "..", "..", "commands");
const eventsDirectory = resolve(__dirname, "..", "..", "events");

//const interactionCache = new Set();

export default class ToastClient extends Client {
    constructor(options?: any) {
        super(options || {});

        this.commands = new Collection();
        this.config = config;

        this.clean = text => {
            if (typeof (text) === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            } else {
                return text;
            }
        };
    }

    randomId() {
        return randomString(16, "0123456789abcdef");
    }

    async connect() {
        await super.login(process.env.CLIENT_TOKEN);
        await this._loadDB();
        await this._loadEvents(eventsDirectory);
        await this._loadCommands(slashCommandsDirectory);
        await console.log(`[COMMANDS]: ${this.commands.size} slash-command(s) loaded`);
        await setInterval(checkReminders, 60000, this);
        await setInterval(checkMutes, 30000, this);

        return this;
    }

    private async _loadEvents(directory) {
        let count: number = 0;

        for (const filename of readdirSync(directory, "utf8")) {
            if (filename.endsWith(".js") || filename.endsWith(".ts")) {
                const eventClass = require(join(directory, filename))["default"];
                const event: Event = new eventClass(this);
                count++;

                if (event.conf.once) {
                    this.once(event.conf.name, (...args: any[]) => event.run(...args));
                } else {
                    this.on(event.conf.name, (...args: any[]) => event.run(...args));
                }
            }
        }

        console.log(`[EVENTS]: ${count} event(s) loaded`)
        return this;
    }

    private async _loadCommands(directory) {
        for (const filename of readdirSync(directory, "utf8")) {
            if (
                !filename.endsWith(".js") &&
                !filename.endsWith(".ts") &&
                lstatSync(join(directory, filename)).isDirectory()
            )
                await this._loadCommands(join(directory, filename));
            else if (filename.endsWith(".js") || filename.endsWith(".ts")) {
                const commandClass = require(join(directory, filename))["default"];
                const command: Command = new commandClass(this);
                command.conf.path = join(directory, filename);

                const split = join(directory, filename).split(/[\/\\]/g);
                command.help.category = split[split.length - 2];

                this.commands.set(command.help.name, command);
                await this.application.commands.create(command);
            }
        }

        return this;
    }

    private async _loadDB() {
        await Database(this);
    }
}