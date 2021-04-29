import Command from "../../util/classes/Command";
import ToastClient from "../../util/classes/ToastClient";
import { Message } from "discord.js";
//import Embed from "../../util/functions/embed";

export default class extends Command {
    public constructor(client: ToastClient) {
        super(client, {
            name: "help",
            description: "Sends a list of commands and support information.",
            usage: ["!help"],
            aliases: ["h"]
        })
    }

    public async run(client: ToastClient, message: Message) {

    }
}