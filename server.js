const { Client } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Initialize the WhatsApp client
const client = new Client();

let qrCode = ''; // Variable to store the QR code

client.on('qr', async (qr) => {
    console.log('QR received');
    qrCode = await qrcode.toDataURL(qr); // Convert QR to base64 image
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// Initialize the client
client.initialize();

// API endpoint to get the QR code
app.get('/generate-qr', (req, res) => {
    if (!qrCode) {
        return res.status(500).json({ message: 'QR Code not generated yet, please try again later.' });
    }
    res.json({ qr: qrCode });
});

// API to send a WhatsApp message
app.post('/send-message', async (req, res) => {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Phone number and message are required.' });
    }

    try {
        // Append WhatsApp domain to the phone number
        const chatId = `${phoneNumber}@c.us`;

        // Send the message
        const response = await client.sendMessage(chatId, message);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!',
            response,
        });
    } catch (error) {
        console.error('Error sending message:', error);
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
