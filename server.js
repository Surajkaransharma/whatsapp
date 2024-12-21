const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize the WhatsApp client
const client = new Client();

client.on('ready', () => {
    console.log('Client is ready!');

    const phoneNumber = '918058932833';  // Phone number to send the message (without +)
    const message = 'Hello, this is a test message!';

    // Send the message directly to the number
    client.sendMessage(`${phoneNumber}@c.us`, message).then(response => {
        console.log('Message sent:', response);
    }).catch(error => {
        console.error('Error sending message:', error);
    });
});

client.on('qr', qr => {
    // Generate the QR code for WhatsApp login
    qrcode.generate(qr, { small: true });
});

// Initialize the client
client.initialize();