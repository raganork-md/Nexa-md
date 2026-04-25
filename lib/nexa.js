const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs');
const path = require('path');
const { NexaDB } = require('./database');

async function connectToWA(SESSION_ID) {
    // Session setup (Nammal nerathe cheythathu pole)
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');
    const credsJson = Buffer.from(SESSION_ID.split('NEXA-MD~')[1], 'base64').toString('utf-8');
    fs.writeFileSync('./session/creds.json', credsJson);

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const conn = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Nexa-MD", "Safari", "1.0"]
    });

    conn.ev.on('creds.update', saveCreds);

    // 🧩 Plugin Loader
    const plugins = new Map();
    const pluginPath = path.join(__dirname, '../plugins');
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);

    fs.readdirSync(pluginPath).forEach(file => {
        if (file.endsWith('.js')) {
            const plugin = require(path.join(pluginPath, file));
            plugins.set(plugin.name, plugin);
        }
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') console.log("🚀 Nexa-MD: Bot is Online!");
        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) connectToWA(SESSION_ID);
        }
    });

    conn.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        // Database-il ninnu settings edukkunnu
        let settings = await NexaDB.findOne({ id: 'main' });
        if (!settings) settings = await NexaDB.create({ id: 'main' });

        const prefix = settings.prefix;
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        const cmd = plugins.get(command);
        if (cmd) {
            await cmd.execute(conn, msg, { args, settings });
        }
    });
}

module.exports = { connectToWA };
    
