import { Client, Collection } from "discord.js";
import randomString = require("jvar/utility/randomString");
import config from "../../config";
import { existsSync, lstatSync, readdirSync } from "fs";
import { join } from "@fireflysemantics/join";
import { resolve } from "path";
import Event from "./Event";
import Command from "./Command";
import Database from "../database/functions";
import SlashCommand from "./SlashCommand";
import fetch from "node-fetch";
import checkSlashPermissions from "../functions/checkSlashPermissions";
import checkReminders from "../functions/checkReminders";
import checkMutes from "../functions/checkMutes";
const commands = [];

const commandsDirectory = resolve(__dirname, "..", "..", "commands");
const slashCommandsDirectory = resolve(__dirname, "..", "..", "slashCommands");
const eventsDirectory = resolve(__dirname, "..", "..", "events");

export default class ToastClient extends Client {
    constructor(options?: any) {
        super(options || {});

        this.commands = new Collection();
        this.slashCommands = new Collection();
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
        await this._loadCommands(commandsDirectory);
        await this._loadSlashCommands(slashCommandsDirectory);
        await console.log(`[COMMANDS]: ${this.commands.size} command(s) loaded`);
        await console.log(`[SLASHCOMMANDS]: ${this.slashCommands.size} slash-command(s) loaded`);
        await setTimeout(checkReminders, 60000, this);
        await setTimeout(checkMutes, 60000, this);

        await fetch(`https://discord.com/api/v8/applications/${this.user.id}/commands`, {
            method: "PUT",
            body: JSON.stringify(commands),
            headers: {
                Authorization: "Bot " + this.token,
                "Content-Type": "application/json"
            }
        });

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

                const split = join(directory, filename).split(/[\/\\]/g);
                command.setCategory(split[split.length - 2]);

                if (this.commands.has(command.help.name)) {
                    throw new Error("Duplicate command name " + command.help.name);
                }

                this.commands.set(command.help.name, command);
            }
        }

        return this;
    }

    private async _loadEvents(directory) {
        let count: number = 0;

        for (const filename of readdirSync(directory, "utf8")) {
            if (filename.endsWith(".js") || filename.endsWith(".ts")) {
                const eventClass = require(join(directory, filename))["default"];
                const event: Event = new eventClass(this);
                count ++;

                if (event.conf.once) {
                    this.once(event.conf.name, (...args) => event.run(...args));
                } else {
                    this.on(event.conf.name, (...args) => event.run(...args));
                }
            }
        }

        console.log(`[EVENTS]: ${count} event(s) loaded`)
        return this;
    }

    private async _loadSlashCommands(directory) {
        for (const filename of readdirSync(directory, "utf8")) {
            if (
                !filename.endsWith(".js") &&
                !filename.endsWith(".ts") &&
                lstatSync(join(directory, filename)).isDirectory()
            )
                await this._loadSlashCommands(join(directory, filename));
            else if (filename.endsWith(".js") || filename.endsWith(".ts")) {
                const commandClass = require(join(directory, filename))["default"];
                const command: SlashCommand = new commandClass(this);
                command.conf.path = join(directory, filename);

                const split = join(directory, filename).split(/[\/\\]/g);
                command.help.category = split[split.length - 2];

                commands.push({
                    name: command.help.name,
                    description: command.help.description,
                    options: command.conf.options
                });

                this.slashCommands.set(command.help.name, command);
            }
        }

        // @ts-ignore
        this.ws.on("INTERACTION_CREATE", async interaction => {
            const path = this.slashCommands.get(interaction.data.name).conf.path;
            if (!path || !existsSync(path)) return this["api"]["interactions"](interaction.id)(interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: "This command has been disabled."
                    }
                }
            });

            const commandClass = require(path)["default"];
            const command: SlashCommand = new commandClass(this);

            const response = await checkSlashPermissions(this, interaction, command);

            if (response === 401) return this["api"]["interactions"](interaction.id)(interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        flags: 1 << 6,
                        content: "Toast must be in this server in order to use slash commands."
                    }
                }
            });

            if (response) {
                return this["api"]["interactions"](interaction.id)(interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            flags: 1 << 6,
                            content: `The minimum permission level required to run this command is: \`${response}\``
                        }
                    }
                });
            }

            return command.run(this, interaction);
        });

        return this;
    }

    private async _loadDB() {
        await Database(this);
    }
}