require("dotenv").config();

const { ShardingManager } = require("discord.js");
const manager = new ShardingManager("./bot.js", {
    totalShards: "auto",
    token: process.env.CLIENT_TOKEN
});

manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();