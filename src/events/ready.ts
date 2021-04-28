import ToastClient from "../util/classes/ToastClient";
import Event from "../util/classes/Event";
import { TextChannel } from "discord.js";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "ready", once: false })
    }

    public async run() {
        let logChannel = await this.client.channels.fetch(this.client.config.logChannel)
            .catch(e => null);

        if (logChannel) {
            if (((logChannel): logChannel is TextChannel => logChannel.type === "text")(logChannel)) await logChannel.send(`Toast is now online as ${this.client.user.tag}. The current time is ${new Date()}.`);
        }

        console.log(`Logged in as ${this.client.user.tag} (${this.client.user.id})`);

        await this.client.user.setActivity("the bread", {
            type: "WATCHING",
        });
    }
};
