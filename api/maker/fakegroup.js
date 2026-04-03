const { createCanvas, loadImage } = require('canvas');

export default async function handler(req, res) {
    const { title, number, time, url } = req.body;
    
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#075e54';
    ctx.fillRect(0, 0, 400, 600);
    
    // Header
    ctx.fillStyle = '#128c7e';
    ctx.fillRect(0, 0, 400, 80);
    
    // Avatar group
    if (url) {
        try {
            const img = await loadImage(url);
            ctx.drawImage(img, 20, 15, 50, 50);
        } catch (e) {
            ctx.fillStyle = '#25d366';
            ctx.beginPath();
            ctx.arc(45, 40, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = '#25d366';
        ctx.beginPath();
        ctx.arc(45, 40, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(title || 'Group Name', 90, 35);
    
    ctx.font = '12px Arial';
    ctx.fillText(number || '123 members', 90, 60);
    
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    
    res.json({ result: `data:image/png;base64,${base64}` });
}