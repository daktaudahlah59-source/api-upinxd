const { createCanvas, loadImage } = require('canvas');

export default async function handler(req, res) {
    const { username, likes, comment, share, repost, date, desc, avatar, content } = req.body;
    
    const canvas = createCanvas(400, 500);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 500);
    
    // Avatar
    if (avatar) {
        try {
            const img = await loadImage(avatar);
            ctx.drawImage(img, 15, 15, 40, 40);
        } catch (e) {
            ctx.fillStyle = '#e4405f';
            ctx.beginPath();
            ctx.arc(35, 35, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = '#e4405f';
        ctx.beginPath();
        ctx.arc(35, 35, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#262626';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(username || 'username', 70, 35);
    
    // Content image
    if (content) {
        try {
            const img = await loadImage(content);
            ctx.drawImage(img, 0, 70, 400, 300);
        } catch (e) {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 70, 400, 300);
        }
    } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 70, 400, 300);
    }
    
    // Likes
    ctx.fillStyle = '#262626';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`❤️ ${likes || '0'} likes`, 15, 400);
    
    // Caption
    ctx.font = '12px Arial';
    ctx.fillText(`${username || 'user'} ${desc || 'Caption here'}`, 15, 430);
    
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    
    res.json({ result: `data:image/png;base64,${base64}` });
}