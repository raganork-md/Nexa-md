const config = require('../config');

const runtime = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    return (d > 0 ? d + "d " : "") + (h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + (s > 0 ? s + "s" : "");
};

module.exports = {
    name: 'alive',
    category: 'utility',
    async execute(conn, msg, { sender }) {
        const up = runtime(process.uptime());
        const aliveMsg = `*NEXA-MD IS ONLINE* 🧬\n\n*Hey* @${sender.split('@')[0]}\n*Uptime:* ${up}\n*Mode:* ${config.MODE}\n\n_System is stable and running smoothly._`;
        
        await conn.sendMessage(msg.key.remoteJid, { 
            text: aliveMsg,
            mentions: [sender]
        }, { quoted: msg });
    }
};
