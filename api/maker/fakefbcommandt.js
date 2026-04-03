const { createCanvas, loadImage } = require('canvas');

export default async function handler(req, res) {
    const { name, comment, url } = req.body;
    
    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, 600, 200);
    
    // Avatar
    if (url) {
        try {
            const img = await loadImage(url);
            ctx.drawImage(img, 20, 20, 50, 50);
        } catch (e) {
            ctx.fillStyle = '#1877f2';
            ctx.beginPath();
            ctx.arc(45, 45, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = '#1877f2';
        ctx.beginPath();
        ctx.arc(45, 45, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Name
    ctx.fillStyle = '#385898';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(name || 'User', 90, 35);
    
    // Comment
    ctx.fillStyle = '#1c1e21';
    ctx.font = '14px Arial';
    ctx.fillText(comment || 'Nice post!', 90, 65);
    
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    
    res.json({ result: `data:image/png;base64,${base64}` });
}