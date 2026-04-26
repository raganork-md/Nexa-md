const config = require('../config');

module.exports = [
    // 1. PING COMMAND
    {
        name: 'ping',
        category: 'main',
        async execute(conn, msg) {
            const start = new Date().getTime();
            const { remoteJid } = msg.key;
            const message = await conn.sendMessage(remoteJid, { text: '📡 *Nexa-MD Latency...*' });
            const end = new Date().getTime();
            await conn.sendMessage(remoteJid, { 
                text: `⚡ *Speed:* ${end - start}ms`, 
                edit: message.key 
            });
        }
    },

    // 2. ALIVE COMMAND
    {
        name: 'alive',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            const aliveText = `*NEXA-MD IS ONLINE* 🧬\n\n*User:* ${config.OWNER_NAME}\n*Prefix:* ${prefix}\n*Status:* System Stable ✅`;
            await conn.sendMessage(msg.key.remoteJid, {
                image: { url: config.ALIVE_IMG },
                caption: aliveText
            }, { quoted: msg });
        }
    },

    // 3. CLEAN STYLE MENU
    {
        name: 'menu',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            const from = msg.key.remoteJid;
            
            let menuText = `╔══════════════════╗\n`;
            menuText += `║     *${config.BOT_NAME.toUpperCase()}* \n`;
            menuText += `╚══════════════════╝\n\n`;
            
            menuText += `┌───〔 *USER INFO* 〕───┈⊷\n`;
            menuText += `│ 👑 *User:* ${config.OWNER_NAME}\n`;
            menuText += `│ 🛠️ *Prefix:* ${prefix}\n`;
            menuText += `│ 🚀 *Mode:* ${config.MODE}\n`;
            menuText += `└──────────────────┈⊷\n\n`;

            menuText += `┌───〔 *MAIN COMMANDS* 〕───┈⊷\n`;
            menuText += `│ 📥 ${prefix}ping\n`;
            menuText += `│ 📥 ${prefix}alive\n`;
            menuText += `│ 📥 ${prefix}menu\n`;
            menuText += `└──────────────────┈⊷\n\n`;

            menuText += `_Nexa-MD: Simple & Powerful_ 🛡️`;

            try {
                await conn.sendMessage(from, {
                    image: { url: config.ALIVE_IMG },
                    caption: menuText
                }, { quoted: msg });
            } catch (error) {
                await conn.sendMessage(from, { text: menuText }, { quoted: msg });
            }
        }
    }
];
