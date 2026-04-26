const config = require('../config');
const path = require('path');
const fs = require('fs');

module.exports = [
    // 1. PING COMMAND
    {
        name: 'ping',
        category: 'main',
        async execute(conn, msg, { args }) {
            try {
                const start = new Date().getTime();
                const { remoteJid } = msg.key;
                const message = await conn.sendMessage(remoteJid, { text: '⚡ *Nexa Speed Test...*' });
                const end = new Date().getTime();
                await conn.sendMessage(remoteJid, { 
                    text: `*Latency:* ${end - start}ms 🚀`, 
                    edit: message.key 
                });
            } catch (e) {
                console.log("Ping Error:", e);
            }
        }
    },

    // 2. ALIVE COMMAND
    {
        name: 'alive',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            try {
                const aliveText = `*HEY! NEXA-MD IS ONLINE* 🧬\n\n*User:* ${config.OWNER_NAME}\n*Prefix:* ${prefix}\n*Mode:* ${config.MODE}\n\n_System is stable and running smoothly._`;
                await conn.sendMessage(msg.key.remoteJid, {
                    image: { url: config.ALIVE_IMG || 'https://telegra.ph/file/default_image.jpg' },
                    caption: aliveText
                }, { quoted: msg });
            } catch (e) {
                console.log("Alive Error:", e);
                await conn.sendMessage(msg.key.remoteJid, { text: "*NEXA-MD IS ALIVE* 🚀" });
            }
        }
    },

    // 3. MENU COMMAND
    {
        name: 'menu',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            try {
                const from = msg.key.remoteJid;
                
                let menuText = `╭━━〔 *${config.BOT_NAME}* 〕━━┈⊷\n`;
                menuText += `┃ 👑 *Owner:* ${config.OWNER_NAME}\n`;
                menuText += `┃ 🛠️ *Prefix:* [ ${prefix} ]\n`;
                menuText += `╰━━━━━━━━━━━━━━┈⊷\n\n`;

                menuText += `*📂 MAIN COMMANDS*\n`;
                menuText += `┃ 📥 ${prefix}ping\n`;
                menuText += `┃ 📥 ${prefix}alive\n`;
                menuText += `┃ 📥 ${prefix}menu\n\n`;

                menuText += `*Built by MUSTHAFA M P* 🛡️`;

                // Image load ആയില്ലെങ്കിൽ വെറും ടെക്സ്റ്റ് മെനു അയക്കാൻ വേണ്ടിയുള്ള സെറ്റപ്പ്
                await conn.sendMessage(from, {
                    image: { url: config.ALIVE_IMG || 'https://telegra.ph/file/default_image.jpg' },
                    caption: menuText
                }, { quoted: msg }).catch(async () => {
                    await conn.sendMessage(from, { text: menuText }, { quoted: msg });
                });

            } catch (e) {
                console.error("Menu Error:", e);
                await conn.sendMessage(msg.key.remoteJid, { text: "❌ Menu could not be loaded." });
            }
        }
    }
];
                    
