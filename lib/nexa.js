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
//  SERVER FOR CLOUD HOSTING (Render/Koyeb)
// ═══════════════════════════════════════════════════════
const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.send(`🚀 ${config.BOT_NAME} is running on port ${port}`);
});

app.listen(port, () => {
    console.log(`📡 Local server started on port: ${port}`);
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

    // 1. Optional Database Connection
    if (config.MONGODB && config.MONGODB !== "NO_DB" && !config.MONGODB.includes("cluster.mongodb.net")) {
        try {
            const { connectDB, NexaDB: DBModel } = require('./database');
            await connectDB(config.MONGODB);
            NexaDB = DBModel;
            isDBConnected = true;
            console.log("✅ Database Connected.");
        } catch (e) {
            console.log("⚠️ DB Error: Running in Local Mode.");
        }
    } else {
        console.log("ℹ️ Local Mode Active (No Database).");
    }

    // 2. Session Setup
    const SESSION_ID = config.SESSION_ID;
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');
    try {
        const credsJson = Buffer.from(SESSION_ID.split('NEXA-MD~')[1], 'base64').toString('utf-8');
        fs.writeFileSync('./session/creds.json', credsJson);
    } catch (e) {
        console.log("❌ Fatal Error: Invalid Session ID!");
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

    // 3. Advanced Plugin Loader
    const plugins = new Map();
    const pluginPath = path.join(__dirname, '../plugins');
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);

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
                console.log(`❌ Error loading plugin ${file}:`, err.message);
            }
        }
    });

    // 4. Connection Updates
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(`✅ ${config.BOT_NAME} is Online!`);
            const status = isDBConnected ? "Database Mode" : "Local Mode";
            const msg = `*🚀 ${config.BOT_NAME} IS ONLINE!*\n\n*Status:* ${status}\n*Prefix:* [ ${config.PREFIX} ]`;
            await conn.sendMessage(conn.user.id, { text: msg });
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                connectToWA();
            } else {
                fs.removeSync('./session');
                console.log("❌ Logged out. Delete session and restart.");
            }
        }
    });

    // 5. Message Handler
    conn.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const sender = decodeJid(msg.key.participant || msg.key.remoteJid);
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        let settings = { prefix: config.PREFIX };
        if (isDBConnected) {
            try {
                let dbSettings = await NexaDB.findOne({ id: 'main' });
                if (dbSettings) settings = dbSettings;
            } catch (e) { /* ignore DB fetch errors */ }
        }

        const prefix = settings.prefix || config.PREFIX;
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = plugins.get(commandName);

        if (command) {
            if (config.MODE === 'private' && sender !== decodeJid(conn.user.id)) return;
            try {
                await command.execute(conn, msg, { args, settings, prefix, sender });
            } catch (err) {
                console.error(err);
                await conn.sendMessage(from, { text: "⚠️ Command Error!" });
            }
        }
    });

    return conn;
}

module.exports = { connectToWA };
