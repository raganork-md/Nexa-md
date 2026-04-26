const config = require('../config');
const fs = require('fs');
const path = require('path');

// ബോട്ട് എത്ര നേരമായി ഓടുന്നു എന്ന് കണക്കാക്കാൻ
const runtime = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + "d " : "";
    var hDisplay = h > 0 ? h + "h " : "";
    var mDisplay = m > 0 ? m + "m " : "";
    var sDisplay = s > 0 ? s + "s" : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

module.exports = [
    // 1. PING COMMAND
    {
        name: 'ping',
        category: 'main',
        async execute(conn, msg) {
            const start = new Date().getTime();
            const message = await conn.sendMessage(msg.key.remoteJid, { text: '📡 *Latency check...*' });
            const end = new Date().getTime();
            await conn.sendMessage(msg.key.remoteJid, { 
                text: `🚀 *Response:* ${end - start}ms`, 
                edit: message.key 
            });
        }
    },

    // 2. ALIVE COMMAND (No image, only Uptime & Mention)
    {
        name: 'alive',
        category: 'main',
        async execute(conn, msg, { sender }) {
            const up = runtime(process.uptime());
            const aliveMsg = `*NEXA-MD IS ONLINE* 🧬\n\n*Hey* @${sender.split('@')[0]}\n*Uptime:* ${up}\n*Mode:* ${config.MODE}\n\n_System is stable._`;
            
            await conn.sendMessage(msg.key.remoteJid, { 
                text: aliveMsg,
                mentions: [sender]
            }, { quoted: msg });
        }
    },

    // 3. MENU COMMAND (With Local Image & Mention)
    {
        name: 'menu',
        category: 'main',
        async execute(conn, msg, { prefix, sender }) {
            const from = msg.key.remoteJid;
            const pushName = msg.pushName || "User";
            const imagePath = path.join(__dirname, '../lib/media/nexa.jpg'); // നിന്റെ ഫോട്ടോ ഇവിടെ വേണം
            
            let menuText = `╭━━〔 *${config.BOT_NAME.toUpperCase()}* 〕━━┈⊷\n`;
            menuText += `┃ 👑 *Owner:* ${config.OWNER_NAME}\n`;
            menuText += `┃ 🛠️ *Prefix:* [ ${prefix} ]\n`;
            menuText += `┃ 🚀 *Mode:* ${config.MODE}\n`;
            menuText += `┃ 👤 *User:* @${sender.split('@')[0]}\n`;
            menuText += `╰━━━━━━━━━━━━━━┈⊷\n\n`;

            menuText += `*Hello ${pushName}!* 👋\n\n`;

            menuText += `┌───〔 *COMMANDS* 〕───┈⊷\n`;
            menuText += `│ 📥 ${prefix}ping\n`;
            menuText += `│ 📥 ${prefix}alive\n`;
            menuText += `│ 📥 ${prefix}menu\n`;
            menuText += `└──────────────────┈⊷\n\n`;

            menuText += `_Nexa-MD Active 🛡️_`;

            try {
                if (fs.existsSync(imagePath)) {
                    await conn.sendMessage(from, { 
                        image: fs.readFileSync(imagePath),
                        caption: menuText,
                        mentions: [sender]
                    }, { quoted: msg });
                } else {
                    await conn.sendMessage(from, { text: menuText, mentions: [sender] }, { quoted: msg });
                }
            } catch (e) {
                await conn.sendMessage(from, { text: menuText, mentions: [sender] }, { quoted: msg });
            }
        }
    }
];
