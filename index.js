const { connectToWA } = require('./lib/nexa');
const { connectDB } = require('./lib/database');

const SESSION_ID = "NEXA-MD~YOUR_ID";
const MONGO_URI = "mongodb+srv://user:pass@cluster.mongodb.net/myDB"; // Puthiya MongoDB link ivide iduka

// Database connect cheytha shesham bot start cheyyunnu
connectDB(MONGO_URI).then(() => {
    connectToWA(SESSION_ID);
});
