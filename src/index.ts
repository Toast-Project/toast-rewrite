require("dotenv").config({ path: ".env" });
import { ShardingManager } from "discord.js";

const manager = new ShardingManager("./dist/bot.js", {
    totalShards: "auto",
    token: process.env.CLIENT_TOKEN
});

manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();