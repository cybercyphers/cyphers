const { loadImage, createCanvas } = require('@napi-rs/canvas');

module.exports = {
    name: '3d',
    description: 'Create advanced 3D text images',
    async execute(sock, msg, args) {
        try {
            const text = args.join(' ');
            if (!text || text.length > 15) return;

            const styles = ['hologram', 'cyber', 'crystal', 'neon', 'metal'];
            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            
            const imageBuffer = await createUltra3D(text, randomStyle);
            
            if (imageBuffer) {
                await sock.sendMessage(msg.key.remoteJid, { 
                    image: imageBuffer 
                }, { quoted: msg });
            }

        } catch (error) {
            // Complete silence
        }
    }
};

async function createUltra3D(text, style = 'hologram') {
    const width = 1400;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Advanced cosmic background
    createQuantumBackground(ctx, width, height);

    const fontSize = Math.min(120, Math.max(80, 120 - (text.length * 3)));
    ctx.font = `900 ${fontSize}px Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = width / 2;
    const centerY = height / 2;

    // Apply ultra 3D effect
    switch(style) {
        case 'hologram':
            createHologram3D(ctx, text, centerX, centerY, fontSize);
            break;
        case 'cyber':
            createCyber3D(ctx, text, centerX, centerY, fontSize);
            break;
        case 'crystal':
            createCrystal3D(ctx, text, centerX, centerY, fontSize);
            break;
        case 'neon':
            createNeon3D(ctx, text, centerX, centerY, fontSize);
            break;
        case 'metal':
            createMetal3D(ctx, text, centerX, centerY, fontSize);
            break;
    }

    // Advanced effects
    addQuantumParticles(ctx, width, height);
    addLightStreaks(ctx, width, height);

    return canvas.toBuffer('image/jpeg');
}

function createQuantumBackground(ctx, width, height) {
    // Deep space nebula
    const gradient = ctx.createRadialGradient(
        width * 0.3, height * 0.3, 0,
        width, height, Math.max(width, height) * 0.8
    );
    gradient.addColorStop(0, '#000011');
    gradient.addColorStop(0.2, '#0a0a3a');
    gradient.addColorStop(0.5, '#1a1a6a');
    gradient.addColorStop(0.8, '#0a0a3a');
    gradient.addColorStop(1, '#000005');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Quantum stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 600; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2.5;
        const alpha = Math.random() * 0.8 + 0.2;
        
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Colored stars
    const starColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        const size = Math.random() * 1.5 + 0.5;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createHologram3D(ctx, text, x, y, fontSize) {
    const depth = 25;
    const angle = Math.PI / 4;

    // Holographic extrusion
    for (let i = depth; i > 0; i--) {
        const offsetX = Math.cos(angle) * i * 2;
        const offsetY = Math.sin(angle) * i * 2;
        
        ctx.fillStyle = `rgba(0, 255, 255, ${0.05 + (i * 0.02)})`;
        ctx.fillText(text, x + offsetX, y + offsetY);
    }

    // Holographic front with scan lines
    for (let i = 0; i < 3; i++) {
        const scanOffset = i * 3;
        const alpha = 0.4 - (i * 0.1);
        const gradient = ctx.createLinearGradient(x - 300, y - 150, x + 300, y + 150);
        
        gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 0, 255, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 255, 255, ${alpha})`);
        
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y + scanOffset - 6);
    }

    // Main hologram
    const hologramGradient = ctx.createLinearGradient(x - 350, y - 150, x + 350, y + 150);
    hologramGradient.addColorStop(0, '#00ffff');
    hologramGradient.addColorStop(0.3, '#ff00ff');
    hologramGradient.addColorStop(0.6, '#ffff00');
    hologramGradient.addColorStop(1, '#00ffff');
    
    ctx.fillStyle = hologramGradient;
    ctx.fillText(text, x, y);

    // Glitch effect
    ctx.fillStyle = 'rgba(255, 0, 255, 0.4)';
    ctx.fillText(text, x + 2, y - 2);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.fillText(text, x - 2, y + 2);
}

function createCyber3D(ctx, text, x, y, fontSize) {
    const depth = 20;

    // Cyber grid extrusion
    for (let i = depth; i > 0; i--) {
        const offset = i * 2;
        
        ctx.fillStyle = `rgba(0, 255, 0, ${0.1 + (i * 0.03)})`;
        ctx.fillText(text, x + offset, y + offset);
        
        // Grid lines
        ctx.strokeStyle = `rgba(0, 255, 100, ${0.05 + (i * 0.02)})`;
        ctx.lineWidth = 1;
        ctx.strokeText(text, x + offset, y + offset);
    }

    // Cyber text with data stream effect
    const cyberGradient = ctx.createLinearGradient(x - 400, y - 200, x + 400, y + 200);
    cyberGradient.addColorStop(0, '#00ff00');
    cyberGradient.addColorStop(0.2, '#00ff88');
    cyberGradient.addColorStop(0.5, '#00ffff');
    cyberGradient.addColorStop(0.8, '#0088ff');
    cyberGradient.addColorStop(1, '#0000ff');
    
    ctx.fillStyle = cyberGradient;
    ctx.fillText(text, x, y);

    // Binary code effect
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    for (let i = 0; i < 200; i++) {
        const binX = Math.random() * width;
        const binY = Math.random() * height;
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', binX, binY);
    }
}

function createCrystal3D(ctx, text, x, y, fontSize) {
    const depth = 15;

    // Crystal facets
    for (let i = depth; i > 0; i--) {
        const offset = i * 2;
        
        ctx.fillStyle = `rgba(100, 200, 255, ${0.05 + (i * 0.04)})`;
        ctx.fillText(text, x + offset, y + offset);
        
        // Facet edges
        ctx.strokeStyle = `rgba(200, 230, 255, ${0.1 + (i * 0.02)})`;
        ctx.lineWidth = 1;
        ctx.strokeText(text, x + offset, y + offset);
    }

    // Crystal clear text with refraction
    const crystalGradient = ctx.createLinearGradient(x - 300, y - 150, x + 300, y + 150);
    crystalGradient.addColorStop(0, 'rgba(200, 230, 255, 0.9)');
    crystalGradient.addColorStop(0.3, 'rgba(150, 200, 255, 0.95)');
    crystalGradient.addColorStop(0.7, 'rgba(100, 180, 255, 0.9)');
    crystalGradient.addColorStop(1, 'rgba(200, 230, 255, 0.9)');
    
    ctx.fillStyle = crystalGradient;
    ctx.fillText(text, x, y);

    // Sparkle effects
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 30; i++) {
        const sparkleX = x + (Math.random() - 0.5) * 400;
        const sparkleY = y + (Math.random() - 0.5) * 200;
        const size = Math.random() * 2 + 1;
        ctx.fillRect(sparkleX, sparkleY, size, size);
    }
}

function createNeon3D(ctx, text, x, y, fontSize) {
    const depth = 12;

    // Neon glow extrusion
    for (let i = depth; i > 0; i--) {
        const offset = i * 1.5;
        
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = i * 2;
        ctx.fillStyle = `rgba(255, 0, 255, ${0.1 + (i * 0.06)})`;
        ctx.fillText(text, x + offset, y + offset);
    }

    // Intense neon
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 25;
    const neonGradient = ctx.createLinearGradient(x - 250, y - 100, x + 250, y + 100);
    neonGradient.addColorStop(0, '#ff00ff');
    neonGradient.addColorStop(0.5, '#00ffff');
    neonGradient.addColorStop(1, '#ff00ff');
    
    ctx.fillStyle = neonGradient;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}

function createMetal3D(ctx, text, x, y, fontSize) {
    const depth = 20;
    const angle = Math.PI / 6;

    // Metal extrusion
    for (let i = depth; i > 0; i--) {
        const offsetX = Math.cos(angle) * i * 2;
        const offsetY = Math.sin(angle) * i * 2;
        
        const metalGradient = ctx.createLinearGradient(
            x + offsetX - 150, y + offsetY - 75,
            x + offsetX + 150, y + offsetY + 75
        );
        metalGradient.addColorStop(0, `rgba(120, 120, 120, ${0.1 + i * 0.03})`);
        metalGradient.addColorStop(0.5, `rgba(200, 200, 200, ${0.1 + i * 0.03})`);
        metalGradient.addColorStop(1, `rgba(80, 80, 80, ${0.1 + i * 0.03})`);
        
        ctx.fillStyle = metalGradient;
        ctx.fillText(text, x + offsetX, y + offsetY);
    }

    // Brushed metal front
    const metalFront = ctx.createLinearGradient(x - 300, y - 150, x + 300, y + 150);
    metalFront.addColorStop(0, '#cccccc');
    metalFront.addColorStop(0.1, '#ffffff');
    metalFront.addColorStop(0.3, '#888888');
    metalFront.addColorStop(0.7, '#ffffff');
    metalFront.addColorStop(0.9, '#666666');
    metalFront.addColorStop(1, '#ffffff');
    
    ctx.fillStyle = metalFront;
    ctx.fillText(text, x, y);
}

function addQuantumParticles(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function addLightStreaks(ctx, width, height) {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 8; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const length = Math.random() * 150 + 80;
        const angle = Math.random() * Math.PI * 2;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(
            startX + Math.cos(angle) * length,
            startY + Math.sin(angle) * length
        );
        ctx.stroke();
    }
}
