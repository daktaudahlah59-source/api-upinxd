const { createCanvas } = require('canvas');

export default async function handler(req, res) {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Text required' });
    }
    
    const maxWidth = 800;
    const padding = 20;
    let fontSize = 60;
    
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
    
    res.json({ result: `data:image/png;base64,${base64}` });
}
