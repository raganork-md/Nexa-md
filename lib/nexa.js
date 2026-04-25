const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    jidDecode 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const { NexaDB } = require('./database');

// ═══════════════════════════════════════════════════════
//  HELPERS (JID DECODE)
// ═══════════════════════════════════════════════════════
const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return decode.user && decode.server && decode.user + '@' + decode.server || jid;
    } else return jid;
};

// ═══════════════════════════════════════════════════════
//  CORE CONNECTION FUNCTION
// ═══════════════════════════════════════════════════════
async function connectToWA() {
    const SESSION_ID = config.SESSION_ID;
    
    // 1. Session folder setup
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');
    try {
        const credsJson = Buffer.from(SESSION_ID.split('NEXA-MD~')[1], 'base64').toString('utf-8');
        fs.writeFileSync('./session/creds.json', credsJson);
    } catch (e) {
        console.log("❌ NEXA-MD Error: Invalid Session ID!");
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: [config.BOT_NAME, "Chrome", "1.0.0"]
    });

    conn.ev.on('creds.update', saveCreds);

    // ═══════════════════════════════════════════════════════
    //  ⚡ ADVANCED PLUGIN LOADER (Supports Arrays & Single Objects)
    // ═══════════════════════════════════════════════════════
    const plugins = new Map();
    const pluginPath = path.join(__dirname, '../plugins');
    
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);

    fs.readdirSync(pluginPath).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const plugin = require(path.join(pluginPath, file));
                // Array ആണെങ്കിൽ (ഉദാഹരണത്തിന് Ping, Alive ഒരേ ഫയലിൽ) ഓരോന്നായി ലോഡ് ചെയ്യും
                if (Array.isArray(plugin)) {
                    plugin.forEach(p => {
                        if (p.name) plugins.set(p.name, p);
                    });
                } else {
                    if (plugin.name) plugins.set(plugin.name, plugin);
                }
            } catch (err) {
                console.log(`❌ Error loading plugin ${file}:`, err.message);
            }
        }
    });

    // ═══════════════════════════════════════════════════════
    //  CONNECTION UPDATES
    // ═══════════════════════════════════════════════════════
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log(`✅ ${config.BOT_NAME} is Online!`);
            const welcomeMsg = `*🚀 ${config.BOT_NAME} CONNECTED!*\n\n*Owner:* ${config.OWNER_NAME}\n*Prefix:* ${config.PREFIX}\n*Plugins:* ${plugins.size} Loaded`;
            await conn.sendMessage(conn.user.id, { text: welcomeMsg });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnecting...");
                connectToWA();
            } else {
                console.log("❌ Connection Logged Out.");
                fs.removeSync('./session');
            }
        }
    });

    // ═══════════════════════════════════════════════════════
    //  MESSAGE HANDLER
    // ═══════════════════════════════════════════════════════
    conn.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const sender = decodeJid(msg.key.participant || msg.key.remoteJid);
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        // Load settings from MongoDB
        let settings = await NexaDB.findOne({ id: 'main' });
        if (!settings) settings = await NexaDB.create({ id: 'main', prefix: config.PREFIX });

        const prefix = settings.prefix || config.PREFIX;
        const isCmd = text.startsWith(prefix);

        if (isCmd) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = plugins.get(commandName);

            if (command) {
                // Public/Private Mode Check
                if (config.MODE === 'private' && sender !== decodeJid(conn.user.id)) return;

                try {
                    await command.execute(conn, msg, { args, settings, prefix, sender });
                } catch (err) {
                    console.error("Plugin Error:", err);
                    await conn.sendMessage(from, { text: "⚠️ Command Execution Error!" });
                }
            }
        }
    });

    return conn;
}

module.exports = { connectToWA };
            
