const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Folder to store session data
const sessionsDir = './sessions';
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir);
}

// Store clients and QR codes for multiple users
const clients = {};
const qrCodes = {};

// Function to create a new client
function createClient(userId) {
    const sessionPath = path.join(sessionsDir, userId);

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: userId, // Use unique ID for each user
        }),
    });

    // QR Code generation for the client
    client.on('qr', async (qr) => {
        console.log(`QR received for user ${userId}`);
        qrCodes[userId] = await qrcode.toDataURL(qr); // Store QR code
    });

    client.on('ready', () => {
        console.log(`Client for user ${userId} is ready!`);
        qrCodes[userId] = null; // Clear QR code once client is ready
    });

    client.on('disconnected', (reason) => {
        console.log(`Client for user ${userId} disconnected: ${reason}`);
        delete clients[userId]; // Remove client on disconnect
    });

    client.initialize();

    clients[userId] = client;
}

// API to generate a QR code for a specific user
app.get('/generate-qr/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!clients[userId]) {
        createClient(userId);
    }

    if (!qrCodes[userId]) {
        return res.status(500).json({ message: 'QR Code not generated yet, please try again later.' });
    }

    res.json({ userId, qr: qrCodes[userId] });
});

// API to send a WhatsApp message for a specific user
app.post('/send-message/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { phoneNumber, message } = req.body;

    if (!clients[userId]) {
        return res.status(404).json({ error: `No active session for user ${userId}` });
    }

    if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Phone number and message are required.' });
    }

    try {
        // Append WhatsApp domain to the phone number
        const chatId = `${phoneNumber}@c.us`;

        // Send the message
        const response = await clients[userId].sendMessage(chatId, message);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!',
            response,
        });
    } catch (error) {
        console.error(`Error sending message for user ${userId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to send the message.',
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
