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
const express = require('express');
const config = require('../config');

// ═══════════════════════════════════════════════════════
//  LOCAL SERVER FOR RENDER/CLOUDFLARE
// ═══════════════════════════════════════════════════════
const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.send(`🚀 ${config.BOT_NAME} is active and running.`);
});

app.listen(port, () => {
    console.log(`📡 Server started on port: ${port}`);
});

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
//  CORE CONNECTION FUNCTION
// ═══════════════════════════════════════════════════════
async function connectToWA() {
    let isDBConnected = false;
    let NexaDB;

    // Optional MongoDB Connection
    if (config.MONGODB && config.MONGODB !== "NO_DB") {
        try {
            const { connectDB, NexaDB: DBModel } = require('./database');
            await connectDB(config.MONGODB);
            NexaDB = DBModel;
            isDBConnected = true;
            console.log("✅ Database Synced.");
        } catch (e) {
            console.log("ℹ️ Running without Database (Local Mode).");
        }
    }

    // Session Management
    const SESSION_ID = config.SESSION_ID;
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');
    try {
        const credsJson = Buffer.from(SESSION_ID.split('NEXA-MD~')[1], 'base64').toString('utf-8');
        fs.writeFileSync('./session/creds.json', credsJson);
    } catch (e) {
        console.log("❌ Error: Invalid Session ID Format!");
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

    // Plugin Loader
    const plugins = new Map();
    const pluginPath = path.join(__dirname, '../plugins');
    if (fs.existsSync(pluginPath)) {
        fs.readdirSync(pluginPath).forEach(file => {
            if (file.endsWith('.js')) {
                try {
                    const plugin = require(path.join(pluginPath, file));
                    if (Array.isArray(plugin)) {
                        plugin.forEach(p => { if (p.name) plugins.set(p.name, p); });
                    } else {
                        if (plugin.name) plugins.set(plugin.name, plugin);
                    }
                } catch (err) {
                    console.error(`Error loading ${file}:`, err.message);
                }
            }
        });
    }

    // Connection Events
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(`✅ ${config.BOT_NAME} Connected!`);
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        }
    });

    // ═══════════════════════════════════════════════════════
    //  MESSAGE HANDLER (THE CORE ENGINE)
    // ═══════════════════════════════════════════════════════
    conn.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const sender = decodeJid(msg.key.participant || msg.key.remoteJid);
        const botNumber = decodeJid(conn.user.id);
        
        // OWNER CHECK: നിന്റെ നമ്പറോ ബോട്ട് നമ്പറോ ആണെങ്കിൽ Owner ആയി കണക്കാക്കും
        const isOwner = config.OWNER_NUMBER.includes(sender.split('@')[0]) || sender === botNumber;
        
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const prefix = config.PREFIX;
        const mode = config.MODE.toLowerCase();

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = plugins.get(commandName);

        if (command) {
            // MODE LOGIC
            // Private ആണെങ്കിൽ ഓണർക്ക് മാത്രം, Public ആണെങ്കിൽ എല്ലാവർക്കും
            if (mode === 'private' && !isOwner) return;

            try {
                await command.execute(conn, msg, { args, prefix, sender, isOwner });
            } catch (err) {
                console.error("Command Execution Error:", err);
                await conn.sendMessage(from, { text: "⚠️ Command Error!" });
            }
        }
    });

    return conn;
}

module.exports = { connectToWA };
                    
