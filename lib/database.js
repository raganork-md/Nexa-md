const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    antilink: { type: Boolean, default: false },
    welcome: { type: String, default: 'Welcome to the group!' },
    prefix: { type: String, default: '.' }
});

const NexaDB = mongoose.model('NexaDB', BotSchema);

async function connectDB(uri) {
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.error("❌ DB Connection Error:", err);
    }
}

module.exports = { connectDB, NexaDB };
