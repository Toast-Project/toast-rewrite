import ToastClient from "../util/classes/ToastClient";
import Event from "../util/classes/Event";
import { GuildMember } from "discord.js";
import log from "../util/functions/log";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "guildMemberRemove", once: false })
    }

    public async run(member: GuildMember) {
        await log(this.client, member.guild, {
            type: "guildMemberRemove",
            user: member.user,
        });
    }
};
