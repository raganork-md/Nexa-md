const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = [
    // ... (Ping command പഴയപോലെ തന്നെ)

    // 2. ALIVE COMMAND
    {
        name: 'alive',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            const imagePath = path.join(__dirname, '../lib/media/nexa.jpg');
            const aliveText = `*NEXA-MD IS ONLINE* 🧬\n\n*User:* ${config.OWNER_NAME}\n*Prefix:* ${prefix}`;
            
            await conn.sendMessage(msg.key.remoteJid, {
                image: fs.readFileSync(imagePath), // ലോക്കൽ ഫയൽ നേരിട്ട് റീഡ് ചെയ്യുന്നു
                caption: aliveText
            }, { quoted: msg });
        }
    },

    // 3. MENU COMMAND (Local Image)
    {
        name: 'menu',
        category: 'main',
        async execute(conn, msg, { prefix }) {
            const from = msg.key.remoteJid;
            const imagePath = path.join(__dirname, '../lib/media/nexa.jpg'); // ഫോട്ടോയുടെ പാത്ത്
            
            let menuText = `╔══════════════════╗\n`;
            menuText += `║     *${config.BOT_NAME.toUpperCase()}* \n`;
            menuText += `╚══════════════════╝\n\n`;
            
            menuText += `┌───〔 *USER INFO* 〕───┈⊷\n`;
            menuText += `│ 👑 *User:* ${config.OWNER_NAME}\n`;
            menuText += `│ 🛠️ *Prefix:* ${prefix}\n`;
            menuText += `└──────────────────┈⊷\n\n`;

            menuText += `┌───〔 *COMMANDS* 〕───┈⊷\n`;
            menuText += `│ 📥 ${prefix}ping\n`;
            menuText += `│ 📥 ${prefix}alive\n`;
            menuText += `│ 📥 ${prefix}menu\n`;
            menuText += `└──────────────────┈⊷\n\n`;

            menuText += `_Simple & Powerful_ 🛡️`;

            try {
                if (fs.existsSync(imagePath)) {
                    await conn.sendMessage(from, {
                        image: fs.readFileSync(imagePath),
                        caption: menuText
                    }, { quoted: msg });
                } else {
                    // ഫോട്ടോ കണ്ടില്ലെങ്കിൽ ടെക്സ്റ്റ് അയക്കും
                    await conn.sendMessage(from, { text: menuText }, { quoted: msg });
                }
            } catch (error) {
                console.error("Local Image Menu Error:", error);
                await conn.sendMessage(from, { text: menuText }, { quoted: msg });
            }
        }
    }
];
