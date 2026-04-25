const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    delay, 
    jidDecode 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs-extra');
const path = require('path');
const config = require('../config'); // Config import cheyyunnu
const { NexaDB } = require('./database'); // Database import cheyyunnu

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return decode.user && decode.server && decode.user + '@' + decode.server || jid;
    } else return jid;
};

// ═══════════════════════════════════════════════════════
//  MAIN CONNECTION FUNCTION
// ═══════════════════════════════════════════════════════

async function connectToWA() {
    const SESSION_ID = config.SESSION_ID;
    
    // 1. Session folder create & restore
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');
    try {
        const credsJson = Buffer.from(SESSION_ID.split('NEXA-MD~')[1], 'base64').toString('utf-8');
        fs.writeFileSync('./session/creds.json', credsJson);
    } catch (e) {
        console.log("❌ NEXA-MD Error: Invalid Session ID in Config!");
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: [config.BOT_NAME, "Safari", "1.0"],
        syncFullHistory: false,
        markOnlineOnConnect: true
    });

    conn.ev.on('creds.update', saveCreds);

    // 2. Plugin Loader (Auto loads all files from /plugins)
    const plugins = new Map();
    const pluginPath = path.join(__dirname, '../plugins');
    
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);

    fs.readdirSync(pluginPath).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const plugin = require(path.join(pluginPath, file));
                plugins.set(plugin.name, plugin);
            } catch (err) {
                console.log(`❌ Error loading plugin ${file}:`, err.message);
            }
        }
    });

    // 3. Connection Updates
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
            console.log(`⏳ ${config.BOT_NAME}: Connecting...`);
        }

        if (connection === 'open') {
            console.log(`✅ ${config.BOT_NAME}: Connected Successfully!`);
            
            // Send Login Success Message to Owner
            const msg = `*🚀 ${config.BOT_NAME} IS ONLINE!*\n\n*Prefix:* [ ${config.PREFIX} ]\n*Owner:* ${config.OWNER_NAME}\n*Mode:* ${config.MODE}`;
            await conn.sendMessage(conn.user.id, { text: msg });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Connection lost. Reconnecting...");
                connectToWA();
            } else {
                console.log("❌ Logged out. Delete session folder and try again.");
                fs.removeSync('./session');
            }
        }
    });

    // 4. Message Upsert (Command Handler)
    conn.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const sender = decodeJid(msg.key.participant || msg.key.remoteJid);
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        // Fetch Settings from DB
        let settings = await NexaDB.findOne({ id: 'main' });
        if (!settings) settings = await NexaDB.create({ id: 'main', prefix: config.PREFIX });

        const prefix = settings.prefix || config.PREFIX;
        const isCmd = text.startsWith(prefix);

        if (isCmd) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = plugins.get(commandName);

            if (command) {
                // Private mode check
                if (config.MODE === 'private' && sender !== decodeJid(conn.user.id)) return;

                try {
                    await command.execute(conn, msg, { args, settings, prefix, sender });
                } catch (err) {
                    console.error("Plugin Error:", err);
                    await conn.sendMessage(from, { text: "❌ System Error while running command." });
                }
            }
        }
    });

    return conn;
}

module.exports = { connectToWA };
        
