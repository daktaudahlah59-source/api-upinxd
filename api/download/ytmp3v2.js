const axios = require('axios');

export default async function handler(req, res) {
    const { url, apikey } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }
    
    try {
        // Gunakan API YouTube downloader
        const response = await axios.get(`https://api.vevioz.com/api/button/mp3/?url=${encodeURIComponent(url)}`);
        
        res.json({ result: response.data.link });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}