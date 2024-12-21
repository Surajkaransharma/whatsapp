const express = require('express');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API endpoint to generate QR code and return image data
app.post('/generate-qr', async (req, res) => {
    const { data } = req.body;

    if (!data || typeof data !== 'string' || data.trim() === '') {
        return res.status(400).json({ error: 'Invalid data: A non-empty string is required.' });
    }

    try {
        // Generate QR code
        const qrCodeImage = await QRCode.toDataURL(data);

        // Respond with the QR code image data
        res.status(200).json({
            qrCode: qrCodeImage
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});