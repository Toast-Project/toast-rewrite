import { Client, Collection } from "discord.js";
import RandomString from "jvar/utility/randomString";
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
import Embed from "../functions/embed";

const commandsDirectory = resolve(__dirname, "..", "..", "commands");
const slashCommandsDirectory = resolve(__dirname, "..", "..", "slashCommands");
const eventsDirectory = resolve(__dirname, "..", "..", "events");

export default class ToastClient extends Client {
    constructor(options?: any) {
        super(options || {});

        this.randomString = RandomString;
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

    async connect() {
        await super.login(process.env.CLIENT_TOKEN);
        await this._loadEvents(eventsDirectory);
        await this._loadCommands(commandsDirectory);
        await this._loadSlashCommands(slashCommandsDirectory);
        await this._loadDB();
        await console.log(`[COMMANDS]: ${this.commands.size} command(s) loaded`)

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
            if (filename.endsWith(".js") || filename.endsWith(".ts")) {
                const commandClass = require(join(directory, filename))["default"];
                const command: SlashCommand = new commandClass(this);
                command.conf.path = join(directory, filename);

                const body = {
                    name: command.help.name,
                    description: command.help.description
                }

                fetch(`https://discord.com/api/applications/${this.user.id}/commands/`, {
                    method: "post",
                    body: JSON.stringify(body),
                    headers: {
                        Authorization: "Bot " + this.token,
                        "Content-Type": "application/json"
                    },
                })
                    .then(res => res.json());

                this.slashCommands.set(command.help.name, command);
            }
        }

        // @ts-ignore
        this.ws.on("INTERACTION_CREATE", async interaction => {
            const path = resolve(__dirname, "..", "..", `slashCommands/${interaction.data.name}.js`);
            if (!existsSync(path)) return this["api"]["interactions"](interaction.id)(interaction.token).callback.post({
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

            const noEmbed = Embed({
                title: "Missing Permissions",
                color: "RED",
                description: `The minimum permission level required to run this command is: \`${response}\``
            });
            const needEmbed = Embed({
                title: "Toast Required",
                color: "RED",
                description: `Toast must be in this server in order to use slash commands.`
            });

            if (response === 401) return this["api"]["interactions"](interaction.id)(interaction.token).callback.post({
                data: {
                    type: 64,
                    data: {
                        embeds: [needEmbed]
                    }
                }
            });

            if (response) {
                return this["api"]["interactions"](interaction.id)(interaction.token).callback.post({
                    data: {
                        type: 64,
                        data: {
                            embeds: [noEmbed]
                        }
                    }
                });
            }

            return command.run(this, interaction);
        });
    }

    private async _loadDB() {
        await Database(this);
    }
}