const axios = require('axios');

export default async function handler(req, res) {
    const { url, apikey } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }
    
    try {
        // Gunakan API TikTok downloader
        const response = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
        
        res.json({
            result: {
                video_sd: response.data.data.play
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
