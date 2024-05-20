import express from 'express';
import axios from 'axios';
import cors from 'cors';
import cheerio from 'cheerio';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 443;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.get('/profile-image', async (req, res) => {
    const { phone } = req.query;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const whatsappURL = `https://api.whatsapp.com/send/?phone=${phone}`;
        const response = await axios.get(whatsappURL);
        
        const $ = cheerio.load(response.data);
        const imageElement = $('img[alt="Profile Picture"]');

        if (imageElement.length > 0) {
            const imageUrl = imageElement.attr('src');
            return res.status(200).json({ imageUrl });
        } else {
            return res.status(404).json({ error: 'Profile image not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch profile image' });
    }
});

const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log(`HTTPS Server running at https://localhost:${port}`);
});
