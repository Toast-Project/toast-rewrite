import ToastClient from "../classes/ToastClient";
import fetch from "node-fetch";
import { existsSync } from "fs";

export default async function (client: ToastClient) {
    await loadCommands(client);

    // @ts-ignore
    client.ws.on("INTERACTION_CREATE", async interaction => {
        const path = `./commands/${interaction.data.name}`
        if (existsSync(path)) require(path)(client, interaction);
    });
}

async function loadCommands(client) {
    const body = {
        "name": "ping",
        "description": "View the bots latency"
    }

    fetch(`https://discord.com/api/applications/${client.user.id}/commands`, {
        method: "post",
        body: JSON.stringify(body),
        headers: {
            Authorization: "Bot " + client.token,
            "Content-Type": "application/json"
        },
    })
        .then(res => res.json());
}