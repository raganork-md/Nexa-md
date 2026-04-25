const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    // 🔑 Session & Database
    SESSION_ID: process.env.SESSION_ID || "NEXA-MD~PASTE_YOUR_ID_HERE",
    MONGODB: process.env.MONGODB || "mongodb+srv://user:pass@cluster.mongodb.net/myDB",

    // 👤 Bot Personalization
    BOT_NAME: process.env.BOT_NAME || "NEXA-MD",
    OWNER_NAME: process.env.OWNER_NAME || "ANSAD SER",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "916235508514",

    // ⚙️ Bot Settings
    PREFIX: process.env.PREFIX || ".",
    AUTO_READ_STATUS: convertToBool(process.env.AUTO_READ_STATUS, 'true'),
    MODE: process.env.MODE || "public", // 'public' or 'private'
    ANTILINK: convertToBool(process.env.ANTILINK, 'false'),
    
    // ⚡ Other Configs
    ALIVE_IMG: process.env.ALIVE_IMG || "https://telegra.ph/file/your_image.jpg",
    ALIVE_MSG: process.env.ALIVE_MSG || "Hello, I am NEXA-MD! I am alive and working. 🚀"
};
