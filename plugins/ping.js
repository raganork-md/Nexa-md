module.exports = {
    name: 'ping',
    description: 'Ping command to check latency',
    execute: async (client, message) => {
        const latency = Date.now() - message.createdTimestamp;
        await message.channel.send(`Pong! Latency is ${latency}ms.`);
    },
    pattern: /^\.ping$/i
};