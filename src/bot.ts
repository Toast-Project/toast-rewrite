import ToastClient from "./util/classes/ToastClient";
import { Intents } from "discord.js";

const client = new ToastClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.connect();

// Catch unhandled rejections since slash commands cause issues due to slow update rollout
process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});