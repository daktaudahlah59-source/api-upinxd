const { createCanvas } = require('canvas');

export default async function handler(req, res) {
    const { nominal } = req.body;
    
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    
    // Background DANA
    ctx.fillStyle = '#0052cc';
    ctx.fillRect(0, 0, 400, 600);
    
    // Card
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 100, 360, 400);
    
    // Saldo text
    ctx.fillStyle = '#0052cc';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Rp ${nominal || '0'}`, 200, 300);
    
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    
    res.json({ result: `data:image/png;base64,${base64}` });
}