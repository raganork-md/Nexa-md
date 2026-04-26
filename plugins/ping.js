module.exports = {
    name: 'ping',
    category: 'utility',
    async execute(conn, msg) {
        const start = new Date().getTime();
        const { remoteJid } = msg.key;
        const message = await conn.sendMessage(remoteJid, { text: '📡 *Checking Speed...*' });
        const end = new Date().getTime();
        await conn.sendMessage(remoteJid, { 
            text: `🚀 *Response:* ${end - start}ms`, 
            edit: message.key 
        });
    }
};
