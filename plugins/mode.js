const config = require('../config');

module.exports = {
    name: 'mode',
    category: 'owner',
    async execute(conn, msg, { args, isOwner }) {
        // Owner ആണോ എന്ന് ആദ്യം ചെക്ക് ചെയ്യുന്നു
        if (!isOwner) return; 

        const from = msg.key.remoteJid;
        const input = args[0] ? args[0].toLowerCase() : null;

        // 1. വെറും .mode എന്ന് അടിച്ചാൽ (Status അറിയാൻ)
        if (!input) {
            const currentMode = config.MODE.toUpperCase();
            return await conn.sendMessage(from, { 
                text: `🛡️ *Nexa-MD Status*\n\n Current Mode: *${currentMode}*` 
            }, { quoted: msg });
        }

        // 2. .mode public എന്ന് അടിച്ചാൽ
        if (input === 'public') {
            config.MODE = 'public';
            return await conn.sendMessage(from, { 
                text: "🌐 *Mode updated to PUBLIC*\nEveryone can use the bot now." 
            }, { quoted: msg });
        }

        // 3. .mode private എന്ന് അടിച്ചാൽ
        if (input === 'private') {
            config.MODE = 'private';
            return await conn.sendMessage(from, { 
                text: "🔒 *Mode updated to PRIVATE*\nOnly owner can use the bot now." 
            }, { quoted: msg });
        }

        // 4. തെറ്റായ ഇൻപുട്ട് നൽകിയാൽ
        await conn.sendMessage(from, { 
            text: "❌ *Invalid Input!*\nUse: `.mode public` or `.mode private`" 
        }, { quoted: msg });
    }
};
                  
