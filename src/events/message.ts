import ToastClient from "../util/classes/ToastClient";
import runCommand from "../util/functions/runCommand";
import Event from "../util/classes/Event";
import { Message } from "discord.js";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "message", once: false })
    }

    public async run(message: Message) {
        if (message.author.bot) return;

        const prefixes = ["t.", `<@${this.client.user.id}>`, `<@!${this.client.user.id}>`];
        let prefix = "";
        for (const p of prefixes) {
            if (message.content.startsWith(p)) {
                prefix = p;
                break;
            }
        }
        if (!prefix) return;

        const args = message.content.slice(prefix.length).trim().split(" ");
        await runCommand(this.client, message, args);
    }
};
