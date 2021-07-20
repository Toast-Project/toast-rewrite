import ToastClient from "../util/classes/ToastClient";
import Event from "../util/classes/Event";
import { Message } from "discord.js";
import log from "../util/functions/log";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "messageDelete", once: false })
    }

    public async run(message: Message) {
        await log(this.client, message.guild, {
            type: "messageDelete",
            user: message.author,
            channel: message.channel,
            message
        });
    }
};
