const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = [
    {
        name: 'menu',
        category: 'main',
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

            // --- GENERAL ---
            menuText += `╭════〘 *_General_* 〙════⊷❍\n`;
            menuText += `┃◬│ .setvar, .getvar, .delvar, .setenv,\n┃◬│ .delsudo, .afk, .autodl, .chatbot,\n┃◬│ .ai, .info, .list, .alive, .setalive,\n┃◬│ .games, .gif, .rotate, .flip,\n┃◬│ .mention, .reload, .reboot, .delete\n`;
            menuText += `┃◬╰──────────────\n\n`;

            // --- OWNER ---
            menuText += `╭════〘 *_Owner_* 〙════⊷❍\n`;
            menuText += `┃◬│ .allvar, .settings, .setsudo, .getsudo,\n┃◬│ .callreject, .install, .plugin, .remove,\n┃◬│ .pupdate, .block, .join, .unblock,\n┃◬│ .pp, .gpp, .update, .public, .private\n`;
            menuText += `┃◬╰──────────────\n\n`;

            // --- GROUP ---
            menuText += `╭════〘 *_Group_* 〙════⊷❍\n`;
            menuText += `┃◬│ .toggle, .antibot, .antispam, .pdm,\n┃◬│ .antidemote, .antipromote, .antilink,\n┃◬│ .antiword, .automute, .autounmute,\n┃◬│ .getmute, .antifake, .kick, .add,\n┃◬│ .promote, .requests, .leave, .quoted,\n┃◬│ .demote, .mute, .unmute, .jid, .invite,\n┃◬│ .revoke, .glock, .gunlock, .gname,\n┃◬│ .gdesc, .common, .tag, .msgs, .inactive,\n┃◬│ .warn, .warnings, .rmwarn, .resetwarn,\n┃◬│ .warnlist, .setwarnlimit, .warnstats,\n┃◬│ .welcome, .goodbye, .testwelcome,\n┃◬│ .testgoodbye\n`;
            menuText += `┃◬╰──────────────\n\n`;

            // --- UTILITY ---
            menuText += `╭════〘 *_Utility_* 〙════⊷❍\n`;
            menuText += `┃◬│ .uptime, .menu, .testalive, .attp,\n┃◬│ .tts, .upload, .fancy, .filter,\n┃◬│ .filters, .delfilter, .togglefilter,\n┃◬│ .testfilter, .filterhelp, .stickcmd,\n┃◬│ .unstick, .getstick, .diff, .getjids,\n┃◬│ .users, .schedule, .scheduled, .cancel,\n┃◬│ .age, .cntd, .ping, .vv\n`;
            menuText += `┃◬╰──────────────\n\n`;

            // --- SEARCH & EDIT ---
            menuText += `╭════〘 *_Search_* 〙════⊷❍\n`;
            menuText += `┃◬│ .img, .find, .ig\n`;
            menuText += `┃◬╰──────────────\n`;
            menuText += `╭════〘 *_Edit_* 〙════⊷❍\n`;
            menuText += `┃◬│ .sticker, .mp3, .slow, .sped, .bass,\n┃◬│ .photo, .doc, .square, .resize, .compress,\n┃◬│ .trim, .black, .avmix, .vmix, .slowmo,\n┃◬│ .circle, .interp, .take, .mp4, .url\n`;
            menuText += `┃◬╰──────────────\n\n`;

            // --- DOWNLOAD ---
            menuText += `╭════〘 *_Download_* 〙════⊷❍\n`;
            menuText += `┃◬│ .insta, .fb, .story, .pinterest, .tiktok,\n┃◬│ .song, .yts, .ytv, .video, .yta, .play,\n┃◬│ .spotify\n`;
            menuText += `┃◬╰──────────────\n\n`;

            // --- MISC & CONVERTERS ---
            menuText += `╭════〘 *_Misc_* 〙════⊷❍\n`;
            menuText += `┃◬│ .clear, .retry\n`;
            menuText += `┃◬╰──────────────\n`;
            menuText += `╭════〘 *_Converters_* 〙════⊷❍\n`;
            menuText += `┃◬│ .pdf\n`;
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
    },
    
    // Alive Command
    {
        name: 'alive',
        category: 'main',
        async execute(conn, msg, { sender }) {
            const up = process.uptime(); 
            // uptime calculation logical simplified for brevity
            const aliveMsg = `*NEXA-MD IS ONLINE* 🧬\n\n*Hey* @${sender.split('@')[0]}\n*Mode:* ${config.MODE}`;
            await conn.sendMessage(msg.key.remoteJid, { text: aliveMsg, mentions: [sender] }, { quoted: msg });
        }
    },

    // Mode Switch Commands
    {
        name: 'public',
        category: 'owner',
        async execute(conn, msg, { isOwner }) {
            if (!isOwner) return;
            config.MODE = 'public';
            await conn.sendMessage(msg.key.remoteJid, { text: "🌐 *Bot Mode: PUBLIC*" }, { quoted: msg });
        }
    },
    {
        name: 'private',
        category: 'owner',
        async execute(conn, msg, { isOwner }) {
            if (!isOwner) return;
            config.MODE = 'private';
            await conn.sendMessage(msg.key.remoteJid, { text: "🔒 *Bot Mode: PRIVATE*" }, { quoted: msg });
        }
    }
];
