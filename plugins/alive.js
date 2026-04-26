const config = require('../config');

module.exports = [
    // 1. PING COMMAND
    {
        name: 'ping',
        category: 'main',
        async execute(conn, msg) {
            try {
                const start = new Date().getTime();
                const { remoteJid } = msg.key;
                const message = await conn.sendMessage(remoteJid, { text: '⚡ *Nexa-MD Speed Test...*' });
                const end = new Date().getTime();
                await conn.sendMessage(remoteJid, { 
                    text: `*Latency:* ${end - start}ms 🚀`, 
                    edit: message.key 
                });
            } catch (e) {
                console.error("Ping Error:", e);
            }
        }
    },

    // 2. ALIVE COMMAND
    {
        name: 'alive',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            try {
                const aliveText = `*HEY! NEXA-MD IS ONLINE* 🧬\n\n*User:* ${config.OWNER_NAME}\n*Mode:* ${config.MODE}\n\n_System is stable and running smoothly._`;
                await conn.sendMessage(msg.key.remoteJid, {
                    image: { url: config.ALIVE_IMG },
                    caption: aliveText
                }, { quoted: msg });
            } catch (e) {
                await conn.sendMessage(msg.key.remoteJid, { text: "*NEXA-MD IS ALIVE* 🚀" });
            }
        }
    },

    // 3. MENU COMMAND WITH IMAGE SUPPORT
    {
        name: 'menu',
        category: 'main',
        async execute(conn, msg, { prefix }) {
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

            // Image അയക്കാൻ ശ്രമിക്കുന്നു
            try {
                await conn.sendMessage(from, {
                    image: { url: config.ALIVE_IMG },
                    caption: menuText
                }, { quoted: msg });
            } catch (error) {
                // ഇമേജ് ലിങ്ക് വർക്ക് ആകുന്നില്ലെങ്കിൽ വെറും ടെക്സ്റ്റ് മെനു അയക്കും
                console.log("Menu Image Error: Sending text only.");
                await conn.sendMessage(from, { 
                    text: menuText 
                }, { quoted: msg });
            }
        }
    }
];
            
