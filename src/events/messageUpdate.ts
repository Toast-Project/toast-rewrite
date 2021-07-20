import ToastClient from "../util/classes/ToastClient";
import Event from "../util/classes/Event";
import { Message } from "discord.js";
import log from "../util/functions/log";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "messageUpdate", once: false })
    }

    public async run(oldMessage: Message, newMessage: Message) {
        if (oldMessage.content === newMessage.content) return;

        await log(this.client, oldMessage.guild, {
            type: "messageUpdate",
            user: oldMessage.author,
            channel: oldMessage.channel,
            oldMessage,
            newMessage
        });
    }
};
