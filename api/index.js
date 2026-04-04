const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gif-encoder');
const axios = require('axios');
const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Parse URL - TANPA /api/ prefix
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = url.pathname.substring(1); // Hapus leading slash
    
    // GET params
    const getQuery = (key) => url.searchParams.get(key);
    
    // POST body
    let body = {};
    if (req.method === 'POST') {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            body = JSON.parse(Buffer.concat(chunks).toString());
        } catch (e) {}
    }
    
    try {
        // ==================== FAKE DANA ====================
        if (path === 'fakedana' || path === 'fakedanav2') {
            const nominal = req.method === 'GET' ? getQuery('nominal') : body.nominal;
            
            const canvas = createCanvas(400, 600);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#0052cc';
            ctx.fillRect(0, 0, 400, 600);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(20, 100, 360, 400);
            ctx.fillStyle = '#0052cc';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Rp ${nominal || '0'}`, 200, 300);
            
            const buffer = canvas.toBuffer('image/png');
            const base64 = buffer.toString('base64');
            return res.json({ result: `data:image/png;base64,${base64}` });
        }
        
        // ==================== BRAT ====================
        if (path === 'brat') {
            const { text } = req.method === 'GET' ? { text: getQuery('text') } : body;
            if (!text) return res.status(400).json({ error: 'Text required' });
            
            const maxWidth = 800;
            const padding = 20;
            const fontSize = 60;
            
            const canvas = createCanvas(maxWidth, 400);
            const ctx = canvas.getContext('2d');
            
            function wrapText(ctx, text, maxWidth, fontSize) {
                ctx.font = `${fontSize}px Arial`;
                const words = text.split('');
                const lines = [];
                let currentLine = '';
                for (let i = 0; i < words.length; i++) {
                    const testLine = currentLine + words[i];
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth - padding * 2 && currentLine.length > 0) {
                        lines.push(currentLine);
                        currentLine = words[i];
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine) lines.push(currentLine);
                return lines;
            }
            
            let lines = wrapText(ctx, text, maxWidth, fontSize);
            if (lines.length === 0) lines = [text];
            
            const lineHeight = fontSize * 1.2;
            const canvasHeight = lines.length * lineHeight + padding * 2;
            canvas.width = maxWidth;
            canvas.height = canvasHeight;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, maxWidth, canvasHeight);
            ctx.fillStyle = '#000000';
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            for (let i = 0; i < lines.length; i++) {
                const y = padding + (i * lineHeight) + fontSize / 2;
                ctx.fillText(lines[i], maxWidth / 2, y);
            }
            
            const buffer = canvas.toBuffer('image/png');
            const base64 = buffer.toString('base64');
            return res.json({ result: `data:image/png;base64,${base64}` });
        }
        
        // ==================== BRAT VID (GIF) ====================
        if (path === 'bratvid') {
            const { text } = req.method === 'GET' ? { text: getQuery('text') } : body;
            if (!text) return res.status(400).json({ error: 'Text required' });
            
            const width = 400;
            const height = 400;
            const fontSize = 40;
            
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            
            function wrapText(ctx, text, maxWidth, fontSize) {
                ctx.font = `${fontSize}px Arial`;
                const words = text.split('');
                const lines = [];
                let currentLine = '';
                for (let i = 0; i < words.length; i++) {
                    const testLine = currentLine + words[i];
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth - 40 && currentLine.length > 0) {
                        lines.push(currentLine);
                        currentLine = words[i];
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine) lines.push(currentLine);
                return lines;
            }
            
            const lines = wrapText(ctx, text, width, fontSize);
            const lineHeight = fontSize * 1.2;
            const baseY = height / 2;
            const numFrames = 30;
            
            const gif = new GIFEncoder(width, height);
            gif.setDelay(50);
            gif.setRepeat(0);
            gif.start();
            
            for (let frame = 0; frame < numFrames; frame++) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = '#000000';
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const offsetY = Math.sin(frame * 0.5) * 15;
                for (let i = 0; i < lines.length; i++) {
                    const y = baseY + offsetY + (i - lines.length / 2) * lineHeight;
                    ctx.fillText(lines[i], width / 2, y);
                }
                gif.addFrame(ctx);
            }
            gif.finish();
            const buffer = gif.out.getData();
            const base64 = buffer.toString('base64');
            return res.json({ result: `data:image/gif;base64,${base64}` });
        }
        
        // ==================== TIKTOK DOWNLOADER ====================
        if (path === 'tiktok') {
            const url = getQuery('url');
            if (!url) return res.status(400).json({ error: 'URL required' });
            
            const response = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
            return res.json({ result: { video_sd: response.data.data.play } });
        }
        
        // ==================== YT MP3 ====================
        if (path === 'ytmp3' || path === 'ytmp3v2') {
            const url = getQuery('url');
            if (!url) return res.status(400).json({ error: 'URL required' });
            
            const response = await axios.get(`https://api.vevioz.com/api/button/mp3/?url=${encodeURIComponent(url)}`);
            return res.json({ result: response.data.link });
        }
        
        // ==================== SCREENSHOT ====================
        if (path === 'ssweb') {
            const url = getQuery('url');
            if (!url) return res.status(400).json({ error: 'URL required' });
            
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
            await browser.close();
            
            return res.json({ result: `data:image/png;base64,${screenshot}` });
        }
        
        // ==================== FAKE TIKTOK PROFILE ====================
        if (path === 'faketiktok') {
            const { name, username, following, followers, likes, url: avatarUrl } = req.method === 'GET' ? 
                { name: getQuery('name'), username: getQuery('username'), following: getQuery('following'), followers: getQuery('followers'), likes: getQuery('likes'), url: getQuery('url') } : body;
            
            const canvas = createCanvas(400, 600);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 400, 600);
            
            if (avatarUrl) {
                try {
                    const img = await loadImage(avatarUrl);
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(200, 100, 50, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(img, 150, 50, 100, 100);
                    ctx.restore();
                } catch (e) {
                    ctx.fillStyle = '#ff0050';
                    ctx.beginPath();
                    ctx.arc(200, 100, 50, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = '#ff0050';
                ctx.beginPath();
                ctx.arc(200, 100, 50, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(name || 'User', 200, 190);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#666666';
            ctx.fillText(`@${username || 'username'}`, 200, 220);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(following || '0', 130, 280);
            ctx.fillText(followers || '0', 200, 280);
            ctx.fillText(likes || '0', 270, 280);
            ctx.font = '12px Arial';
            ctx.fillStyle = '#666666';
            ctx.fillText('Following', 130, 300);
            ctx.fillText('Followers', 200, 300);
            ctx.fillText('Likes', 270, 300);
            
            const buffer = canvas.toBuffer('image/png');
            const base64 = buffer.toString('base64');
            return res.json({ result: `data:image/png;base64,${base64}` });
        }
        
        // ==================== FAKE TIKTOK COMMENT ====================
        if (path === 'fakettcomment') {
            const { username, comment, date, url: avatarUrl } = req.method === 'GET' ? 
                { username: getQuery('username'), comment: getQuery('comment'), date: getQuery('date'), url: getQuery('url') } : body;
            
            const canvas = createCanvas(500, 150);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 500, 150);
            
            if (avatarUrl) {
                try {
                    const img = await loadImage(avatarUrl);
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(45, 45, 30, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(img, 15, 15, 60, 60);
                    ctx.restore();
                } catch (e) {
                    ctx.fillStyle = '#ff0050';
                    ctx.beginPath();
                    ctx.arc(45, 45, 30, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = '#ff0050';
                ctx.beginPath();
                ctx.arc(45, 45, 30, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`@${username || 'username'}`, 90, 30);
            ctx.font = '12px Arial';
            ctx.fillStyle = '#666666';
            ctx.fillText(date || 'now', 90, 50);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#000000';
            
            const maxWidth = 380;
            const words = (comment || 'Nice video!').split(' ');
            let line = '';
            let y = 75;
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && line.length > 0) {
                    ctx.fillText(line, 90, y);
                    line = words[i] + ' ';
                    y += 20;
                } else {
                    line = testLine;
                }
            }
            if (line) ctx.fillText(line, 90, y);
            
            const buffer = canvas.toBuffer('image/png');
            const base64 = buffer.toString('base64');
            return res.json({ result: `data:image/png;base64,${base64}` });
        }
        
        // ==================== NOT FOUND ====================
        return res.status(404).json({ 
            error: 'Endpoint not found',
            available: ['brat', 'bratvid', 'fakedana', 'fakedanav2', 'tiktok', 'ytmp3', 'ytmp3v2', 'ssweb', 'faketiktok', 'fakettcomment']
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
