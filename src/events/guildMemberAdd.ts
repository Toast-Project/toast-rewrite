import ToastClient from "../util/classes/ToastClient";
import Event from "../util/classes/Event";
import { GuildMember } from "discord.js";
import log from "../util/functions/log";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "guildMemberAdd", once: false })
    }

    public async run(member: GuildMember) {
        await log(this.client, member.guild, {
            type: "guildMemberAdd",
            user: member.user,
        });
    }
};
