const { createCanvas, loadImage } = require('canvas');

export default async function handler(req, res) {
    const { nama, durasi, avatar } = req.body;
    
    const canvas = createCanvas(400, 700);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 400, 700);
    
    // Avatar
    if (avatar) {
        try {
            const img = await loadImage(avatar);
            ctx.drawImage(img, 150, 100, 100, 100);
        } catch (e) {
            ctx.fillStyle = '#ff3366';
            ctx.beginPath();
            ctx.arc(200, 150, 50, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(200, 150, 50, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Nama
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(nama || 'Unknown', 200, 280);
    
    // Durasi
    ctx.fillStyle = '#cccccc';
    ctx.font = '16px Arial';
    ctx.fillText(durasi || 'Calling...', 200, 330);
    
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    
    res.json({ result: `data:image/png;base64,${base64}` });
}