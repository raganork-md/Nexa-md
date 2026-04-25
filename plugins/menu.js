const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    category: 'main',
    async execute(conn, msg, { prefix }) {
        const from = msg.key.remoteJid;
        const pluginPath = path.join(__dirname, '../plugins');
        const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));

        let menuData = {};

        // എല്ലാ പ്ലഗിനുകളും റീഡ് ചെയ്ത് കാറ്റഗറി തിരിക്കുന്നു
        pluginFiles.forEach(file => {
            const plugin = require(path.join(pluginPath, file));
            const category = plugin.category || 'misc'; // കാറ്റഗറി ഇല്ലെങ്കിൽ 'misc'-ലേക്ക് പോകും
            
            if (!menuData[category]) {
                menuData[category] = [];
            }
            menuData[category].push(plugin.name);
        });

        let menuText = `╭━━〔 *${config.BOT_NAME}* 〕━━┈⊷\n`;
        menuText += `┃ 👑 *Owner:* ${config.OWNER_NAME}\n`;
        menuText += `┃ 🛠️ *Prefix:* [ ${prefix} ]\n`;
        menuText += `╰━━━━━━━━━━━━━━┈⊷\n\n`;

        // ഓരോ കാറ്റഗറിയും അതിലെ കമാൻഡുകളും ലൂപ്പ് ചെയ്ത് ആഡ് ചെയ്യുന്നു
        Object.keys(menuData).forEach(category => {
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
};
            
