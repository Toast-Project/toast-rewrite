import ToastClient from "../util/classes/ToastClient";
import Event from "../util/classes/Event";
import { Message } from "discord.js";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "messageDelete", once: false })
    }

    public async run(message: Message) {
        if (message.command && !message.command?.conf.saveResponse && message.response) await message.response.delete();
    }
};
