export default function (client, interaction) {
    return client["api"]["interactions"](interaction.id)(interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: `Pong!`
            }
        }
    })
}