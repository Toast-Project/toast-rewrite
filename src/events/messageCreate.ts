import ToastClient from "../util/classes/ToastClient";
import Event from "../util/classes/Event";
import { Message } from "discord.js";
import { addXP } from "../util/functions/leveling";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "messageCreate", once: false })
    }

    public async run(message: Message) {
        if (message.author.bot) return;

        await this.client.db.members.newMember(message.guild.id, message.author.id);
        message.guild.data = await this.client.db.guilds.get(message.guild.id) || {};
        message.author.data = await this.client.db.users.get(message.author.id) || {};
        message.member.data = await this.client.db.members.get(message.guild.id, message.author.id) || {};

        return addXP(this.client, message);
    }
};
