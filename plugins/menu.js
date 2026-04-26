const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    category: 'utility',
    async execute(conn, msg, { prefix, sender }) {
        const from = msg.key.remoteJid;
        const pushName = msg.pushName || "User";
        const imagePath = path.join(__dirname, '../lib/media/nexa.jpg');

        let menuText = `╭━━〔 *${config.BOT_NAME.toUpperCase()}* 〕━━┈⊷\n`;
        menuText += `┃ 👑 *Owner:* ${config.OWNER_NAME}\n`;
        menuText += `┃ 🛠️ *Prefix:* [ ${prefix} ]\n`;
        menuText += `┃ 🚀 *Mode:* ${config.MODE}\n`;
        menuText += `┃ 👤 *User:* @${sender.split('@')[0]}\n`;
        menuText += `╰━━━━━━━━━━━━━━┈⊷\n\n`;

        menuText += `*Hello ${pushName}!* 👋\n\n`;

        menuText += `╭════〘 *_General_* 〙════⊷❍\n`;
        menuText += `┃◬│ .setvar, .getvar, .delvar, .setenv,\n┃◬│ .delsudo, .afk, .autodl, .chatbot,\n┃◬│ .ai, .info, .list, .alive, .setalive,\n┃◬│ .games, .gif, .rotate, .flip,\n┃◬│ .mention, .reload, .reboot, .delete\n`;
        menuText += `┃◬╰──────────────\n\n`;

        menuText += `╭════〘 *_Owner_* 〙════⊷❍\n`;
        menuText += `┃◬│ .allvar, .settings, .setsudo, .getsudo,\n┃◬│ .callreject, .install, .plugin, .remove,\n┃◬│ .pupdate, .block, .join, .unblock,\n┃◬│ .pp, .gpp, .update, .public, .private\n`;
        menuText += `┃◬╰──────────────\n\n`;

        menuText += `╭════〘 *_Group_* 〙════⊷❍\n`;
        menuText += `┃◬│ .kick, .add, .promote, .demote,\n┃◬│ .mute, .unmute, .antilink, .tag,\n┃◬│ .welcome, .goodbye, .warn, .jid\n`;
        menuText += `┃◬╰──────────────\n\n`;

        menuText += `╭════〘 *_Download_* 〙════⊷❍\n`;
        menuText += `┃◬│ .insta, .fb, .song, .video, .ytv,\n┃◬│ .tiktok, .spotify, .play, .story\n`;
        menuText += `┃◬╰──────────────\n\n`;

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
};
