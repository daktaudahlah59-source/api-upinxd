const puppeteer = require('puppeteer');

export default async function handler(req, res) {
    const { url, apikey } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }
    
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
        await browser.close();
        
        res.json({ result: `data:image/png;base64,${screenshot}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
