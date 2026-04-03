const axios = require('axios');

export default async function handler(req, res) {
    const { q, apikey } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Query required' });
    }
    
    try {
        // Gunakan YouTube API atau scraper
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(q)}&key=YOUR_YOUTUBE_API_KEY`);
        
        const results = response.data.items.map(item => ({
            title: item.snippet.title,
            author: { name: item.snippet.channelTitle },
            url: `https://youtube.com/watch?v=${item.id.videoId}`,
            duration: { timestamp: 'N/A' },
            views: 0
        }));
        
        res.json({ result: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
