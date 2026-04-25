const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = [
    // 1. PING COMMAND
    {
        name: 'ping',
        category: 'main',
        async execute(conn, msg, { args }) {
            const start = new Date().getTime();
            const { remoteJid } = msg.key;
            const message = await conn.sendMessage(remoteJid, { text: '⚡ *Nexa Speed Test...*' });
            const end = new Date().getTime();
            await conn.sendMessage(remoteJid, { 
                text: `*Latency:* ${end - start}ms 🚀`, 
                edit: message.key 
            });
        }
    },

    // 2. ALIVE COMMAND
    {
        name: 'alive',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            const aliveText = `*HEY! NEXA-MD IS ONLINE* 🧬\n\n*User:* ${config.OWNER_NAME}\n*Prefix:* ${prefix}\n*Mode:* ${config.MODE}\n\n_System is stable and running smoothly._`;
            await conn.sendMessage(msg.key.remoteJid, {
                image: { url: config.ALIVE_IMG },
                caption: aliveText
            }, { quoted: msg });
        }
    },

    // 3. AUTOMATIC MENU COMMAND
    {
        name: 'menu',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            const from = msg.key.remoteJid;
            const pluginPath = path.join(__dirname, '../plugins');
            const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));

            let menuData = {};

            // Plugin scan cheythu category thirikkunnu
            pluginFiles.forEach(file => {
                const plugin = require(path.join(pluginPath, file));
                if (Array.isArray(plugin)) {
                    plugin.forEach(p => {
                        const cat = p.category || 'misc';
                        if (!menuData[cat]) menuData[cat] = [];
                        menuData[cat].push(p.name);
                    });
                } else {
                    const cat = plugin.category || 'misc';
                    if (!menuData[cat]) menuData[cat] = [];
                    menuData[cat].push(plugin.name);
                }
            });

            let menuText = `╭━━〔 *${config.BOT_NAME}* 〕━━┈⊷\n`;
            menuText += `┃ 👑 *Owner:* ${config.OWNER_NAME}\n`;
            menuText += `┃ 🛠️ *Prefix:* [ ${prefix} ]\n`;
            menuText += `╰━━━━━━━━━━━━━━┈⊷\n\n`;

            Object.keys(menuData).sort().forEach(category => {
                menuText += `*📂 ${category.toUpperCase()}*\n`;
                menuData[category].forEach(cmd => {
                    menuText += `┃ 📥 ${prefix}${cmd}\n`;
                });
                menuText += `\n`;
            });

            menuText += `*Built by MUSTHAFA M P* 🛡️`;

            await conn.sendMessage(from, {
                image: { url: config.ALIVE_IMG },
                caption: menuText
            }, { quoted: msg });
        }
    }
];
                      
