// index.js

const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Buffer } = require('buffer');

// Load session management in Base64
const auth = useMultiFileAuthState('./auth');

const startBot = async () => {
    const { state, saveCreds } = auth;

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'debug' })
    });

    sock.ev.on('creds.update', saveCreds);

    // Connection handling
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log('Connection closed, reconnecting...');
            // Handle disconnections
            if ((lastDisconnect.error) && (lastDisconnect.error.output.statusCode !== 401)) {
                startBot(); // Reconnect on error
            }
        } else if (connection === 'open') {
            console.log('Connection is open');
        }
    });

    // Log activity
    sock.ev.on('messages.upsert', (message) => {
        console.log('Received message: ', message);
    });
};

// Start the bot
startBot();
