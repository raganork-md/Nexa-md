const config = require('../config');

module.exports = {
    name: 'menu',
    description: 'Show all commands of Nexa-MD',
    async execute(conn, msg, { args, prefix, sender }) {
        const from = msg.key.remoteJid;

        // സമയം അനുസരിച്ച് ആശംസകൾ മാറ്റാൻ (Good Morning/Afternoon/Evening)
        const date = new Date();
        const hour = date.getHours();
        let greeting = "Good Night 🌙";
        if (hour >= 5 && hour < 12) greeting = "Good Morning ☀️";
        else if (hour >= 12 && hour < 17) greeting = "Good Afternoon 🌤️";
        else if (hour >= 17 && hour < 21) greeting = "Good Evening 🌆";

        const menuText = `
╭━━〔 *${config.BOT_NAME}* 〕━━┈⊷
┃ 👑 *Owner:* ${config.OWNER_NAME}
┃ 🕒 *Greeting:* ${greeting}
┃ 🛠️ *Prefix:* [ ${prefix} ]
┃ 💻 *Mode:* ${config.MODE}
┃ 📅 *Date:* ${date.toLocaleDateString()}
╰━━━━━━━━━━━━━━┈⊷

*NEXA-MD COMMAND LIST* 🚀

*📂 DOWNLOADER*
┃ 📥 ${prefix}yts (YouTube Search)
┃ 📥 ${prefix}video (YT Video)
┃ 📥 ${prefix}song (YT Audio)
┃ 📥 ${prefix}fb (Facebook DL)
┃ 📥 ${prefix}ig (Instagram DL)

*📂 GROUP TOOLS*
┃ 🚫 ${prefix}antilink (on/off)
┃ 👋 ${prefix}welcome (Set msg)
┃ 🏷️ ${prefix}tagall (Mention all)
┃ 🚪 ${prefix}kick (Remove member)

*📂 CONVERTERS*
┃ 🎙️ ${prefix}mp3 (Video to Audio)
┃ ✨ ${prefix}sticker (Image to Sticker)

*📂 MAIN COMMANDS*
┃ ⚡ ${prefix}ping (Check speed)
┃ 🧬 ${prefix}alive (Check status)
┃ ℹ️ ${prefix}menu (Show this list)

*Built by MUSTHAFA M P* 🛡️
`;

        // ഇമേജ് ഉണ്ടെങ്കിൽ ഇമേജ് സഹിതം മെനു അയക്കും, ഇല്ലെങ്കിൽ ടെക്സ്റ്റ് മാത്രം
        if (config.ALIVE_IMG) {
            await conn.sendMessage(from, {
                image: { url: config.ALIVE_IMG },
                caption: menuText
            }, { quoted: msg });
        } else {
            await conn.sendMessage(from, { text: menuText }, { quoted: msg });
        }
    }
};
