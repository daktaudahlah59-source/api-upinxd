const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder');

export default async function handler(req, res) {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Text required' });
    }
    
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
    
    res.json({ result: `data:image/gif;base64,${base64}` });
}